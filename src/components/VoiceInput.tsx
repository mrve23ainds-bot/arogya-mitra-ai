import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

// Primary + fallback locales for each language (some devices/browsers don't ship every Indian locale)
const languageLocales: Record<string, string[]> = {
  en: ["en-IN", "en-US", "en-GB"],
  hi: ["hi-IN", "hi"],
  ta: ["ta-IN", "ta-LK", "ta"],
  ml: ["ml-IN", "ml"],
  te: ["te-IN", "te"],
  kn: ["kn-IN", "kn"],
};

const languageNames: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  ml: "Malayalam",
  te: "Telugu",
  kn: "Kannada",
};

const VoiceInput = ({ onTranscript, language }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const onTranscriptRef = useRef(onTranscript);
  const localeIndexRef = useRef(0);
  const retryingRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const buildRecognition = useCallback((locale: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.continuous = true; // keep listening — Tamil/regional often pause mid-sentence
    instance.interimResults = true;
    instance.maxAlternatives = 3;
    instance.lang = locale;

    instance.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) {
        finalTranscriptRef.current += finalText;
      }
      // ignore interimText — we only commit on stop / final
    };

    instance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error, "locale:", locale);

      // Try next fallback locale for language-not-supported
      if (event.error === "language-not-supported") {
        const locales = languageLocales[language] || ["en-IN"];
        if (localeIndexRef.current < locales.length - 1) {
          localeIndexRef.current += 1;
          retryingRef.current = true;
          // restart with next locale
          setTimeout(() => startWithLocale(locales[localeIndexRef.current]), 100);
          return;
        }
        toast.error(
          `${languageNames[language] || "This language"} voice input isn't supported on this device. Please type instead, or try Chrome on Android.`
        );
        setIsListening(false);
        return;
      }

      if (event.error === "no-speech") {
        toast.error("No speech detected. Please speak louder and try again.");
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
      } else if (event.error === "audio-capture") {
        toast.error("No microphone found. Please check your device.");
      } else if (event.error === "network") {
        toast.error("Network error. Voice recognition needs internet.");
      } else if (event.error !== "aborted") {
        toast.error("Could not understand. Please try again.");
      }
      setIsListening(false);
    };

    instance.onend = () => {
      if (retryingRef.current) {
        retryingRef.current = false;
        return;
      }
      setIsListening(false);
      const text = finalTranscriptRef.current.trim();
      if (text) {
        onTranscriptRef.current(text);
        finalTranscriptRef.current = "";
      }
    };

    return instance;
  }, [language]);

  const startWithLocale = useCallback((locale: string) => {
    try {
      const instance = buildRecognition(locale);
      if (!instance) {
        toast.error("Voice input not supported on this browser. Please use Chrome.");
        return;
      }
      recognitionRef.current = instance;
      finalTranscriptRef.current = "";
      instance.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      toast.error("Failed to start voice input. Please try again.");
      setIsListening(false);
    }
  }, [buildRecognition]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input not supported on this browser. Please use Chrome for best results.");
      return;
    }

    localeIndexRef.current = 0;
    const locales = languageLocales[language] || ["en-IN"];
    const langName = languageNames[language] || "";
    toast.info(`Listening in ${langName}... Speak now`);
    startWithLocale(locales[0]);
  };

  return (
    <Button
      onClick={toggleListening}
      size="icon"
      variant="outline"
      className={`h-12 w-12 rounded-2xl transition-all ${
        isListening
          ? "bg-destructive text-destructive-foreground border-destructive animate-pulse shadow-strong"
          : "hover:bg-muted"
      }`}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </Button>
  );
};

export default VoiceInput;
