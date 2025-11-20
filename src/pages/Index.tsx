import { useState } from "react";
import { Mic, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceInput from "@/components/VoiceInput";
import SymptomChat from "@/components/SymptomChat";
import HealthDirectory from "@/components/HealthDirectory";
import EmergencyContacts from "@/components/EmergencyContacts";
import { getTranslation, type Language } from "@/lib/translations";

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
                  {getTranslation(selectedLanguage as Language, "appName")}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {getTranslation(selectedLanguage as Language, "tagline")}
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
                  {getTranslation(selectedLanguage as Language, "checkSymptoms")}
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setCurrentScreen("directory")}
                    variant="outline"
                    className="h-14 border-2"
                    size="lg"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {getTranslation(selectedLanguage as Language, "findCare")}
                  </Button>
                  <Button 
                    onClick={() => setCurrentScreen("emergency")}
                    variant="destructive"
                    className="h-14"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {getTranslation(selectedLanguage as Language, "emergency")}
                  </Button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 gap-3 pt-4">
                <div className="bg-card rounded-2xl p-4 text-center shadow-soft">
                  <div className="text-2xl font-bold text-secondary">12+</div>
                  <div className="text-xs text-muted-foreground mt-1">{getTranslation(selectedLanguage as Language, "languages")}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "chat":
        return <SymptomChat language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
      
      case "directory":
        return <HealthDirectory onBack={() => setCurrentScreen("welcome")} language={selectedLanguage} />;
      
      case "emergency":
        return <EmergencyContacts onBack={() => setCurrentScreen("welcome")} language={selectedLanguage} />;
      
      default:
        return null;
    }
  };

  return renderScreen();
};

export default Index;
