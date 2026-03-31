import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInput from "./VoiceInput";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTranslation, type Language } from "@/lib/translations";

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
      const nearbyHospitals = JSON.parse(localStorage.getItem('nearbyHospitals') || '[]');
      const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');

      const { data, error } = await supabase.functions.invoke("health-assistant", {
        body: {
          message: text,
          language: language,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          nearbyHospitals: nearbyHospitals.slice(0, 2),
          userLocation: userLocation
        },
      });

      if (error) throw error;

      if (data?.response) {
        const assistantMessage: Message = { role: "assistant", content: data.response };
        setMessages((prev) => [...prev, assistantMessage]);
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
      <div className="bg-gradient-to-r from-primary to-secondary p-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground fill-primary-foreground/40" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{getTranslation(language as Language, "symptomChecker")}</h2>
              <p className="text-sm text-primary-foreground/70 font-light">{getTranslation(language as Language, "aiHealthAssistant")}</p>
            </div>
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
                className={`max-w-[85%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg"
                    : "bg-card text-card-foreground rounded-3xl rounded-bl-lg shadow-soft border border-border/50"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card rounded-3xl rounded-bl-lg p-4 shadow-soft border border-border/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <VoiceInput onTranscript={handleVoiceInput} language={language} />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(input)}
            placeholder={getTranslation(language as Language, "typeSymptoms")}
            className="flex-1 h-12 text-base rounded-2xl"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSendMessage(input)}
            size="icon"
            className="h-12 w-12 rounded-2xl"
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
