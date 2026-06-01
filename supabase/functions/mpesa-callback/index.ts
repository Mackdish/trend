import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constant-time string comparison
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const CALLBACK_TOKEN = Deno.env.get("MPESA_CALLBACK_TOKEN");

    // ---- Verify shared-secret token ----
    if (!CALLBACK_TOKEN) {
      console.error("MPESA_CALLBACK_TOKEN not configured");
      return new Response("Server misconfigured", { status: 500 });
    }
    const url = new URL(req.url);
    const provided =
      url.searchParams.get("token") ?? req.headers.get("x-callback-token") ?? "";
    if (!safeEqual(provided, CALLBACK_TOKEN)) {
      console.warn("Invalid callback token");
      return new Response("Forbidden", { status: 403 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const resultCode = body.ResultCode ?? body.resultCode ?? body.result_code;
    const reference = body.reference ?? body.BillRefNumber ?? body.AccountReference;

    if (!reference) {
      return new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentStatus = resultCode === 0 || resultCode === "0" ? "paid" : "failed";

    await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        status: paymentStatus === "paid" ? "confirmed" : "pending",
      })
      .eq("id", reference);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
