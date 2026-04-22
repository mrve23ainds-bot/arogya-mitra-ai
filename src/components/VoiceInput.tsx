import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

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
  const finalTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const localeIndexRef = useRef(0);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    localeIndexRef.current = 0;
    try {
      recognitionRef.current?.abort();
    } catch {}
    setIsListening(false);
  }, [language]);

  const buildRecognition = useCallback((locale: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    instance.lang = locale;

    instance.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onTranscriptRef.current(transcript);
      }
      finalTranscriptRef.current = "";
    };

    instance.onerror = (event: any) => {
      const localeError = `${event.error}${locale ? ` (${locale})` : ""}`;
      console.error("Speech recognition error:", localeError);

      if (event.error === "language-not-supported") {
        const locales = languageLocales[language] || ["en-IN"];
        const nextLocale = locales[localeIndexRef.current + 1];

        if (nextLocale) {
          localeIndexRef.current += 1;
          toast.error(
            `${languageNames[language] || "This language"} is not supported with ${locale} on this browser. Tap the mic again to try ${nextLocale}.`
          );
        } else {
          toast.error(
            `${languageNames[language] || "This language"} voice input is not supported on this browser/device. Error: ${localeError}`
          );
        }
      } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast.error(`Microphone permission blocked. Error: ${localeError}`);
      } else if (event.error === "no-speech") {
        toast.error(`No speech detected. Error: ${localeError}`);
      } else if (event.error === "audio-capture") {
        toast.error(`No microphone detected. Error: ${localeError}`);
      } else if (event.error === "network") {
        toast.error(`Voice recognition needs internet. Error: ${localeError}`);
      } else if (event.error !== "aborted") {
        toast.error(`Voice input failed. Error: ${localeError}`);
      }

      setIsListening(false);
    };

    instance.onend = () => {
      setIsListening(false);
    };

    return instance;
  }, [language]);

  const startWithLocale = useCallback((locale: string) => {
    try {
      const instance = buildRecognition(locale);
      if (!instance) {
        toast.error("Voice input is not supported on this browser. Please use Chrome.");
        return;
      }

      recognitionRef.current = instance;
      instance.start();
      setIsListening(true);
    } catch (error: any) {
      console.error("Failed to start speech recognition:", error);

      if (error?.name === "NotAllowedError") {
        toast.error(`Permission denied. Error: ${error.name}`);
      } else if (error?.name === "InvalidStateError") {
        toast.error(`Microphone is already active. Error: ${error.name}`);
      } else {
        toast.error(`Could not start voice input. Error: ${error?.name || "unknown"}`);
      }

      setIsListening(false);
    }
  }, [buildRecognition]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input not supported on this browser. Please use Chrome for best results.");
      return;
    }

    const locales = languageLocales[language] || ["en-IN"];
    const locale = locales[localeIndexRef.current] || locales[0];
    const languageName = languageNames[language] || "selected language";

    toast.info(`Listening in ${languageName} (${locale})... Speak now`);
    startWithLocale(locale);
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
