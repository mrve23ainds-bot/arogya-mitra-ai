import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

const languageMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  ml: "ml-IN",
  te: "te-IN",
  kn: "kn-IN",
};

const VoiceInput = ({ onTranscript, language }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const onTranscriptRef = useCallback(onTranscript, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    instance.lang = languageMap[language] || "en-IN";

    instance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) onTranscriptRef(transcript);
      setIsListening(false);
    };

    instance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access.");
      } else if (event.error === "language-not-supported") {
        toast.error("This language is not supported for voice input on your device. Please type instead.");
      } else {
        toast.error("Could not understand. Please try again.");
      }
      setIsListening(false);
    };

    instance.onend = () => setIsListening(false);
    setRecognition(instance);

    return () => {
      try { instance.abort(); } catch {}
    };
  }, [language, onTranscriptRef]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Voice input not supported on this browser. Please use Chrome for best results.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = languageMap[language] || "en-IN";
        recognition.start();
        setIsListening(true);
        const langName = language === "en" ? "English" : language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : language === "ml" ? "Malayalam" : language === "te" ? "Telugu" : language === "kn" ? "Kannada" : "";
        toast.info(`Listening in ${langName}... Speak now`);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        toast.error("Failed to start voice input. Please try again.");
      }
    }
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
