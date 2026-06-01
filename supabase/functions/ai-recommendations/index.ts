import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { searchQuery, limit = 6 } = await req.json();
    if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim().length < 2) {
      return new Response(JSON.stringify({ error: "A search query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products (name, brand, category, price, gender, description)
    const { data: products, error: dbErr } = await supabase
      .from("products")
      .select("id, name, brand, gender, description, price, category_id, is_featured, sold_count, rating")
      .eq("in_stock", true)
      .order("sold_count", { ascending: false })
      .limit(200);

    if (dbErr) throw dbErr;
    if (!products?.length) {
      return new Response(JSON.stringify({ recommendedIds: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a compact product catalog for the AI
    const catalog = products.map((p, i) => `${i}|${p.name}|${p.brand}|${p.gender || "unisex"}|KES${p.price}|${(p.description || "").slice(0, 80)}`).join("\n");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a shoe store product recommendation engine. Given a customer's search intent, pick the most relevant products from the catalog. Return ONLY a JSON array of product indices (0-based numbers), ordered by relevance. Return at most ${limit} indices. No explanation, just the JSON array like [0,3,7].`,
          },
          {
            role: "user",
            content: `Customer searched for: "${searchQuery.trim()}"\n\nProduct catalog (index|name|brand|gender|price|description):\n${catalog}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_products",
              description: "Return recommended product indices",
              parameters: {
                type: "object",
                properties: {
                  indices: {
                    type: "array",
                    items: { type: "number" },
                    description: "Array of product indices from the catalog, ordered by relevance",
                  },
                },
                required: ["indices"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_products" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let indices: number[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        indices = (parsed.indices || [])
          .filter((i: number) => typeof i === "number" && i >= 0 && i < products.length)
          .slice(0, limit);
      } catch {
        console.error("Failed to parse tool call args");
      }
    }

    const recommendedIds = indices.map((i) => products[i].id);

    return new Response(JSON.stringify({ recommendedIds, query: searchQuery.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommendation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
