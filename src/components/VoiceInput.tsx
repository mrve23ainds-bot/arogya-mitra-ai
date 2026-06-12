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
  ta: ["ta-IN", "ta", "ta-LK"],
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
  const retryingRef = useRef(false);
  const startWithLocaleRef = useRef<(locale: string) => void>(() => {});

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const buildRecognition = useCallback((locale: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.maxAlternatives = 3;
    instance.lang = locale;

    instance.onresult = (event: any) => {
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }

      if (finalText) {
        finalTranscriptRef.current += `${finalText} `;
      }
    };

    instance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error, "locale:", locale);

      const isLocaleFailure =
        event.error === "language-not-supported" || event.error === "service-not-allowed";

      if (isLocaleFailure) {
        const locales = languageLocales[language] || ["en-IN"];
        if (localeIndexRef.current < locales.length - 1) {
          // Automatically retry with the next locale — no re-tap needed
          localeIndexRef.current += 1;
          retryingRef.current = true;
          const nextLocale = locales[localeIndexRef.current];
          try {
            startWithLocaleRef.current(nextLocale);
          } catch {
            setIsListening(false);
          }
          return;
        }

        toast.error(
          `${languageNames[language] || "This language"} voice input isn't supported on this browser. Please type your symptoms instead.`
        );
        setIsListening(false);
        return;
      }

      if (event.error === "not-allowed") {
        toast.error("Microphone blocked. Please allow mic access in browser settings, then try again.");
      } else if (event.error === "no-speech") {
        toast.error("No speech detected. Please speak clearly and try again.");
      } else if (event.error === "audio-capture") {
        toast.error("No microphone detected on this device.");
      } else if (event.error === "network") {
        toast.error("Voice recognition needs internet. Please check your connection.");
      } else if (event.error !== "aborted") {
        toast.error("Voice input failed. Please try again.");
      }

      setIsListening(false);
    };

    instance.onend = () => {
      if (retryingRef.current) {
        retryingRef.current = false;
        return;
      }

      setIsListening(false);
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) {
        onTranscriptRef.current(transcript);
      }
      finalTranscriptRef.current = "";
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
        toast.error("Permission denied. Please allow microphone access and try again.");
      } else if (error?.name === "InvalidStateError") {
        toast.error("Microphone is already active. Please wait a moment and try again.");
      } else {
        toast.error("Could not start voice input. Please try again.");
      }

      setIsListening(false);
    }
  }, [buildRecognition]);

  useEffect(() => {
    startWithLocaleRef.current = startWithLocale;
  }, [startWithLocale]);

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

    // Start synchronously inside the click handler to keep the user-gesture chain
    localeIndexRef.current = 0;
    retryingRef.current = false;
    finalTranscriptRef.current = "";
    const locales = languageLocales[language] || ["en-IN"];
    const languageName = languageNames[language] || "selected language";

    toast.info(`Listening in ${languageName}... Speak now`);
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
