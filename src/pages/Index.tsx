import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import SymptomChat from "@/components/SymptomChat";
import { getTranslation, type Language } from "@/lib/translations";

type Screen = "welcome" | "chat";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  if (currentScreen === "chat") {
    return <SymptomChat language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
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

        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        <Button
          onClick={() => setCurrentScreen("chat")}
          className="w-full h-16 text-lg rounded-2xl shadow-medium hover:shadow-strong transition-all hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          <Sparkles className="mr-3 h-5 w-5" />
          {getTranslation(selectedLanguage as Language, "checkSymptoms")}
        </Button>

        <p className="text-center text-xs text-muted-foreground/60 font-light pt-2">
          Your health companion — always here for you ☕
        </p>
      </div>
    </div>
  );
};

export default Index;
