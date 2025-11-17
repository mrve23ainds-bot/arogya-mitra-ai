import { useState } from "react";
import { Mic, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceInput from "@/components/VoiceInput";
import SymptomChat from "@/components/SymptomChat";
import HealthDirectory from "@/components/HealthDirectory";
import EmergencyContacts from "@/components/EmergencyContacts";

type Screen = "welcome" | "chat" | "directory" | "emergency";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Logo/Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-strong">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Health Sahayak
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your trusted health companion, offline and in your language
                </p>
              </div>

              {/* Language Selection */}
              <LanguageSelector 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />

              {/* Main Actions */}
              <div className="space-y-4">
                <Button 
                  onClick={() => setCurrentScreen("chat")}
                  className="w-full h-16 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-medium hover:shadow-strong transition-all"
                  size="lg"
                >
                  <Mic className="mr-3 h-6 w-6" />
                  Check Symptoms
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setCurrentScreen("directory")}
                    variant="outline"
                    className="h-14 border-2"
                    size="lg"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Find Care
                  </Button>
                  <Button 
                    onClick={() => setCurrentScreen("emergency")}
                    variant="destructive"
                    className="h-14"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Emergency
                  </Button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-card rounded-2xl p-4 text-center shadow-soft">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground mt-1">Offline</div>
                </div>
                <div className="bg-card rounded-2xl p-4 text-center shadow-soft">
                  <div className="text-2xl font-bold text-secondary">12+</div>
                  <div className="text-xs text-muted-foreground mt-1">Languages</div>
                </div>
                <div className="bg-card rounded-2xl p-4 text-center shadow-soft">
                  <div className="text-2xl font-bold text-accent">Free</div>
                  <div className="text-xs text-muted-foreground mt-1">Forever</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "chat":
        return <SymptomChat language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
      
      case "directory":
        return <HealthDirectory onBack={() => setCurrentScreen("welcome")} />;
      
      case "emergency":
        return <EmergencyContacts onBack={() => setCurrentScreen("welcome")} />;
      
      default:
        return null;
    }
  };

  return renderScreen();
};

export default Index;
