import { useState } from "react";
import { Mic, Phone, MapPin, MessageSquare, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
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
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Warm background decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute bottom-[-15%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-3xl" />
            </div>

            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
              {/* Logo/Header */}
              <div className="text-center space-y-5">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-[2rem] flex items-center justify-center shadow-strong rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Heart className="w-11 h-11 text-primary-foreground fill-primary-foreground/30" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground tracking-tight">
                    {getTranslation(selectedLanguage as Language, "appName")}
                  </h1>
                  <p className="text-muted-foreground text-lg mt-2 font-light leading-relaxed">
                    {getTranslation(selectedLanguage as Language, "tagline")}
                  </p>
                </div>
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
                  className="w-full h-16 text-lg rounded-2xl shadow-medium hover:shadow-strong transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  {getTranslation(selectedLanguage as Language, "checkSymptoms")}
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setCurrentScreen("directory")}
                    variant="outline"
                    className="h-14 rounded-2xl border-2 hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    size="lg"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {getTranslation(selectedLanguage as Language, "findCare")}
                  </Button>
                  <Button 
                    onClick={() => setCurrentScreen("emergency")}
                    variant="destructive"
                    className="h-14 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {getTranslation(selectedLanguage as Language, "emergency")}
                  </Button>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-card rounded-3xl p-5 text-center shadow-soft border border-border/50">
                <div className="text-3xl font-bold text-primary">12+</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">{getTranslation(selectedLanguage as Language, "languages")}</div>
              </div>

              {/* Warm footer */}
              <p className="text-center text-xs text-muted-foreground/60 font-light pt-2">
                Your health companion — always here for you ☕
              </p>
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
