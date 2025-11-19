import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInput from "./VoiceInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTranslation, type Language } from "@/lib/translations";
import { TextToSpeech } from "@/utils/textToSpeech";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SymptomChatProps {
  language: string;
  onBack: () => void;
}

const SymptomChat = ({ language, onBack }: SymptomChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const ttsRef = useRef<TextToSpeech | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessage = getTranslation(language as Language, "initialMessage");
    setMessages([
      {
        role: "assistant",
        content: initialMessage,
      },
    ]);
  }, [language]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("health-assistant", {
        body: {
          message: text,
          language: language,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch (error: any) {
      console.error("Error calling health assistant:", error);
      toast.error(error.message || "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    handleSendMessage(transcript);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-medium">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{getTranslation(language as Language, "symptomChecker")}</h2>
            <p className="text-sm text-white/80">{getTranslation(language as Language, "aiHealthAssistant")}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-soft ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card rounded-2xl p-4 shadow-soft">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <VoiceInput onTranscript={handleVoiceInput} language={language} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder={getTranslation(language as Language, "typeSymptoms")}
            className="flex-1 h-12 text-base"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage(input)}
            size="icon"
            className="h-12 w-12"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChat;
