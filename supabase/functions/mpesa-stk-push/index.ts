import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TUMA_API_URL = "https://api.tuma.co.ke";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TUMA_API_KEY = Deno.env.get("TUMA_API_KEY");
    const TUMA_EMAIL = Deno.env.get("TUMA_EMAIL");
    if (!TUMA_API_KEY || !TUMA_EMAIL) {
      throw new Error("Tuma credentials are not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const CALLBACK_TOKEN = Deno.env.get("MPESA_CALLBACK_TOKEN") ?? "";

    // ---- AuthN: require signed-in user ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const userToken = authHeader.replace("Bearer ", "").trim();
    if (!userToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${userToken}` } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Validate input ----
    const { phone, orderId } = await req.json();
    if (!phone || !orderId) {
      return new Response(
        JSON.stringify({ error: "phone and orderId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (!cleanPhone.startsWith("254") || cleanPhone.length !== 12) {
      return new Response(
        JSON.stringify({ error: "Phone must be in 254XXXXXXXXX format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---- AuthZ: caller must own the order; fetch authoritative total ----
    // Use the user's RLS-scoped client so they can only read their own order.
    const { data: order, error: orderErr } = await userClient
      .from("orders")
      .select("id, total, user_id, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order || order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Order already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = Number(order.total);

    // Step 1: Get auth token from Tuma
    const authRes = await fetch(`${TUMA_API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: TUMA_API_KEY, email: TUMA_EMAIL }),
    });
    const authText = await authRes.text();
    if (!authRes.ok) throw new Error(`Tuma auth failed [${authRes.status}]`);
    let authData: any;
    try { authData = JSON.parse(authText); } catch { throw new Error("Tuma auth returned non-JSON"); }
    const tumaToken = authData.token || authData.access_token || authData.data?.token || authData.data?.access_token;
    if (!tumaToken) throw new Error("No token in Tuma auth response");

    // Step 2: Initiate STK Push (callback URL signed with secret token)
    const callbackUrl = CALLBACK_TOKEN
      ? `${SUPABASE_URL}/functions/v1/mpesa-callback?token=${CALLBACK_TOKEN}`
      : `${SUPABASE_URL}/functions/v1/mpesa-callback`;

    const stkRes = await fetch(`${TUMA_API_URL}/payment/stk-push`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tumaToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        phone: cleanPhone,
        callback_url: callbackUrl,
        reference: orderId,
      }),
    });
    const stkData = await stkRes.json();
    if (!stkRes.ok) {
      console.error("STK push failed");
      throw new Error(`STK push failed [${stkRes.status}]`);
    }

    // Update order payment method using service role (bypasses RLS for status fields)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await admin
      .from("orders")
      .update({ payment_method: "mpesa", payment_status: "processing" })
      .eq("id", orderId)
      .eq("user_id", user.id); // double-guard

    return new Response(
      JSON.stringify({ success: true, data: stkData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("M-Pesa STK push error:", error);
    return new Response(
      JSON.stringify({ error: "Payment initiation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
