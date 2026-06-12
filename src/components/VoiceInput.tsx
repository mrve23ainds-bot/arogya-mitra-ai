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

  // Convert any recorded audio blob to 16-bit PCM WAV (16kHz mono) so the AI can decode it
  const blobToWavBase64 = async (blob: Blob): Promise<string> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();

    const targetRate = 16000;
    const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);

    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (offset: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };


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
      const base64 = await blobToWavBase64(blob);
      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audio: base64, mimeType: "audio/wav", language },
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
