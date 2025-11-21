import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Language to voice mapping for better regional support
const languageVoiceMap: Record<string, string> = {
  en: "9BWtsMINqrJLrRacOk9x", // Aria - clear English
  hi: "9BWtsMINqrJLrRacOk9x", // Aria - supports Hindi
  bn: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  te: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  ta: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  mr: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  gu: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  kn: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  ml: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  pa: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  or: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
  as: "9BWtsMINqrJLrRacOk9x", // Aria - multilingual
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY not configured');
      throw new Error('TTS service not configured');
    }

    const voiceId = languageVoiceMap[language] || languageVoiceMap.en;
    
    console.log(`Generating speech for language: ${language}, voice: ${voiceId}`);

    // Call ElevenLabs TTS API with multilingual model
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Best model for multilingual support
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`TTS generation failed: ${response.status}`);
    }

    // Get audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log(`Successfully generated speech, audio size: ${audioBuffer.byteLength} bytes`);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
