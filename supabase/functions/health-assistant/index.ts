import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language, conversationHistory, nearbyHospitals, userLocation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing health query in language:", language);
    console.log("Nearby hospitals:", nearbyHospitals);

    // Build hospital context
    let hospitalContext = "";
    if (nearbyHospitals && nearbyHospitals.length > 0) {
      hospitalContext = `\n\nNearby hospitals available to the user:\n${nearbyHospitals.map((h: any, i: number) => 
        `${i + 1}. ${h.name} (${h.distance} away) - Services: ${h.services.join(', ')}`
      ).join('\n')}`;
    }

    // Build conversation context
    const messages = [
      {
        role: "system",
        content: `You are an AI health assistant for underserved communities. 
        
CRITICAL INSTRUCTIONS:
- User is speaking in language code: ${language}
- Respond ONLY in ${language}, never in English
- Extract health symptoms and conditions from user input
- Keep responses SHORT and SIMPLE
- Include EXACTLY:
  1. 4 home remedies (numbered 1-4, one line each)
  2. 4 things to do / action steps (numbered 1-4, one line each)
- Do NOT suggest hospitals or clinics
- Do NOT give long explanations
- Use simple language anyone can understand
- Be compassionate and reassuring

Base your responses on reliable health information from WHO and medical guidelines.`
      },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in health-assistant:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
