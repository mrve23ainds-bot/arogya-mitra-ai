import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

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
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const handleStop = async () => {
    const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];
    stopStream();

    if (blob.size < 1000) {
      toast.error("No speech detected. Please try again.");
      setIsProcessing(false);
      return;
    }

    try {
      const base64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audio: base64, mimeType, language },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const transcript = (data?.transcript || "").trim();
      if (transcript) {
        onTranscriptRef.current(transcript);
        toast.success("Got your symptoms");
      } else {
        toast.error("Couldn't understand. Please try again.");
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      toast.error(err?.message || "Voice input failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const mimeType =
        preferredTypes.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) || "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setIsListening(false);
        setIsProcessing(true);
        handleStop();
      };

      recorder.onerror = () => {
        toast.error("Recording failed. Please try again.");
        setIsListening(false);
        stopStream();
      };

      recorder.start();
      setIsListening(true);
      toast.info(`Listening in ${languageNames[language] || "selected language"}... Tap again to stop`);
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      if (err?.name === "NotAllowedError") {
        toast.error("Microphone blocked. Please allow mic access in browser settings.");
      } else if (err?.name === "NotFoundError") {
        toast.error("No microphone detected on this device.");
      } else {
        toast.error("Could not access microphone. Please try again.");
      }
      stopStream();
    }
  };

  const toggleListening = () => {
    if (isProcessing) return;
    if (isListening) {
      try {
        mediaRecorderRef.current?.stop();
      } catch {}
      return;
    }
    startRecording();
  };

  return (
    <Button
      onClick={toggleListening}
      size="icon"
      variant="outline"
      disabled={isProcessing}
      className={`h-12 w-12 rounded-2xl transition-all ${
        isListening
          ? "bg-destructive text-destructive-foreground border-destructive animate-pulse shadow-strong"
          : "hover:bg-muted"
      }`}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

export default VoiceInput;
