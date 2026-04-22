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
  const retryingRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const buildRecognition = useCallback((locale: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return null;

    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
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

      if (event.error === "language-not-supported") {
        const locales = languageLocales[language] || ["en-IN"];
        if (localeIndexRef.current < locales.length - 1) {
          localeIndexRef.current += 1;
          retryingRef.current = true;
          setTimeout(() => startWithLocale(locales[localeIndexRef.current]), 120);
          return;
        }

        toast.error(
          `${languageNames[language] || "This language"} voice input is not supported on this device. Please type instead.`
        );
        setIsListening(false);
        return;
      }

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
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
      finalTranscriptRef.current = "";
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

  const micGrantedRef = useRef(false);

  const ensureMicrophoneAccess = useCallback(async () => {
    // If we've already been granted access in this session, skip the re-check.
    // Re-querying getUserMedia after switching languages can lose the user-gesture
    // context in some browsers and surface a false "blocked" error.
    if (micGrantedRef.current) return true;

    if (!navigator.mediaDevices?.getUserMedia) {
      // No mediaDevices API — let SpeechRecognition try directly; it has its own permission flow.
      return true;
    }

    // Check permission state non-blockingly. Only bail if explicitly denied.
    try {
      if (navigator.permissions) {
        const status = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });

        if (status.state === "granted") {
          micGrantedRef.current = true;
          return true;
        }

        if (status.state === "denied") {
          toast.error("Microphone blocked. Enable it in browser site settings and reload the page.");
          return false;
        }
        // 'prompt' → fall through to getUserMedia to trigger the prompt
      }
    } catch {
      // permissions.query not supported (Safari) — fall through
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      micGrantedRef.current = true;
      return true;
    } catch (error: any) {
      console.error("Microphone permission error:", error);

      if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
        toast.error("Permission denied. Please allow microphone access in browser settings.");
      } else if (error?.name === "NotFoundError") {
        toast.error("No microphone found on this device.");
      } else if (error?.name === "NotReadableError") {
        toast.error("Microphone is being used by another app. Close it and try again.");
      } else {
        toast.error("Unable to access microphone. Please try again.");
      }

      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
    };
  }, []);

  const toggleListening = async () => {
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

    const hasMicAccess = await ensureMicrophoneAccess();
    if (!hasMicAccess) return;

    localeIndexRef.current = 0;
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
