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

    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi (हिंदी)",
      ta: "Tamil (தமிழ்)",
      ml: "Malayalam (മലയാളം)",
      te: "Telugu (తెలుగు)",
      kn: "Kannada (ಕನ್ನಡ)",
    };

    const langName = languageNames[language] || "English";

    console.log("Processing health query in language:", language, langName);
    console.log("Nearby hospitals:", nearbyHospitals);

    // Build hospital context
    let hospitalContext = "";
    if (nearbyHospitals && nearbyHospitals.length > 0) {
      hospitalContext = `\n\nNearby hospitals the user can visit:\n${nearbyHospitals.map((h: any, i: number) => 
        `${i + 1}. ${h.name} (${h.distance} away) - Services: ${h.services.join(', ')}`
      ).join('\n')}`;
    }

    const messages = [
      {
        role: "system",
        content: `You are a compassionate AI health assistant for communities in India.

LANGUAGE RULE (MOST IMPORTANT):
- The user speaks ${langName} (language code: ${language})
- You MUST respond ENTIRELY in ${langName}
- Use the native script of that language (e.g. Tamil uses தமிழ் script, Hindi uses देवनागरी, etc.)
- NEVER respond in English unless the language is English

RESPONSE FORMAT:
For any health symptom, provide:

1. **4 Home Remedies** (numbered 1-4, one short line each)
2. **4 Action Steps / Things to Do** (numbered 1-4, one short line each)
3. **Hospital Suggestion** — At the end, add a gentle note: "If symptoms persist or worsen, please visit your nearest hospital or clinic for proper medical attention."
${hospitalContext ? `\nIf the user has nearby hospitals, suggest them by name: ${hospitalContext}` : ""}

RULES:
- Keep it SHORT and SIMPLE — one line per point
- Use simple everyday language, avoid medical jargon
- Be warm and reassuring
- Base advice on WHO and standard medical guidelines
- This is general guidance, not a diagnosis`
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
