import { useState } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInput from "./VoiceInput";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SymptomChatProps {
  language: string;
  onBack: () => void;
}

const SymptomChat = ({ language, onBack }: SymptomChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant. Please describe your symptoms, and I'll help you understand what might be happening and what you should do.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response - in production, this would call Lovable AI
    setTimeout(() => {
      const response = generateHealthResponse(text);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  const generateHealthResponse = (symptoms: string): string => {
    // This is a mock response. In production, this would use Lovable AI with proper medical data
    const lowerSymptoms = symptoms.toLowerCase();
    
    if (lowerSymptoms.includes("fever") || lowerSymptoms.includes("temperature")) {
      return `Based on your symptoms of fever, here's what I recommend:

**Possible Causes:**
- Viral infection (common cold, flu)
- Bacterial infection
- Heat exhaustion

**First Aid:**
1. Rest and stay hydrated
2. Take paracetamol (adults: 500-1000mg every 4-6 hours)
3. Use cold compress on forehead
4. Monitor temperature every 4 hours

**When to seek immediate care:**
- Fever above 103°F (39.4°C)
- Fever lasting more than 3 days
- Difficulty breathing
- Severe headache or stiff neck

Would you like me to find nearby healthcare facilities?`;
    }
    
    if (lowerSymptoms.includes("headache") || lowerSymptoms.includes("head pain")) {
      return `I understand you're experiencing headache. Here's guidance:

**Common Causes:**
- Tension headache
- Dehydration
- Eye strain
- Stress

**Self-Care Steps:**
1. Rest in a quiet, dark room
2. Drink plenty of water
3. Apply cold compress to forehead
4. Gentle head and neck massage

**Red Flags - Seek immediate care if:**
- Sudden, severe headache
- Headache with fever and stiff neck
- Confusion or difficulty speaking
- Vision changes

Would you like to describe any other symptoms?`;
    }

    return `Thank you for sharing your symptoms. I recommend:

1. **Monitor your symptoms** closely
2. **Stay hydrated** - drink plenty of water
3. **Rest** adequately
4. **Consult a healthcare provider** if symptoms worsen

If you're experiencing severe symptoms like:
- Difficulty breathing
- Chest pain
- Severe bleeding
- Loss of consciousness

Please seek immediate medical attention or call emergency services.

Can you tell me more about your symptoms or how long you've had them?`;
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
            <h2 className="text-xl font-semibold">Symptom Checker</h2>
            <p className="text-sm text-white/80">AI Health Assistant</p>
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
            placeholder="Type your symptoms..."
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
