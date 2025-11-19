import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

const VoiceInput = ({ onTranscript, language }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      // Map language codes to speech recognition language codes
      const languageMap: Record<string, string> = {
        en: "en-US", // iOS Safari works better with en-US
        hi: "hi-IN",
        bn: "bn-IN",
        te: "te-IN",
        ta: "ta-IN",
        mr: "mr-IN",
        gu: "gu-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        pa: "pa-IN",
        or: "or-IN",
        as: "as-IN",
      };
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = languageMap[language] || "en-US";
      recognitionInstance.maxAlternatives = 1;
      
      // Show warning for iOS Safari with non-English languages
      if (isIOS && isSafari && language !== "en") {
        toast.error("iOS Safari has limited support for Indian languages. For best results, use English or try Chrome on Android.", {
          duration: 5000
        });
      }

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log(`Recognized ${language}:`, transcript);
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error, "Language:", language);
        if (event.error === "no-speech") {
          toast.error("No speech detected. Please try again.");
        } else if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please allow microphone access.");
        } else {
          toast.error("Could not understand. Please try again.");
        }
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      toast.error("Voice input not supported on this device");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast.info("Listening... Speak now");
    }
  };

  return (
    <Button
      onClick={toggleListening}
      size="lg"
      className={`w-20 h-20 rounded-full transition-all ${
        isListening 
          ? "bg-destructive hover:bg-destructive/90 animate-pulse shadow-strong" 
          : "bg-primary hover:bg-primary/90 shadow-medium hover:shadow-strong"
      }`}
    >
      {isListening ? (
        <MicOff className="w-8 h-8 text-white" />
      ) : (
        <Mic className="w-8 h-8 text-white" />
      )}
    </Button>
  );
};

export default VoiceInput;
