import { useState } from "react";
import { Heart, Sparkles, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import SymptomChat from "@/components/SymptomChat";
import { getTranslation, type Language } from "@/lib/translations";
import { motion } from "framer-motion";

type Screen = "welcome" | "chat";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  if (currentScreen === "chat") {
    return <SymptomChat language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-secondary/8 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-lg w-full space-y-10"
        >
          {/* Logo & Title */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
              className="relative inline-block"
            >
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primary via-secondary to-accent rounded-[2.5rem] flex items-center justify-center shadow-strong rotate-3 hover:rotate-0 transition-transform duration-500">
                <Heart className="w-13 h-13 text-primary-foreground fill-primary-foreground/30" style={{ width: 52, height: 52 }} />
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 w-28 h-28 mx-auto rounded-[2.5rem] bg-primary/20 animate-ping" style={{ animationDuration: "3s" }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-foreground tracking-tight leading-tight">
                {getTranslation(selectedLanguage as Language, "appName")}
              </h1>
              <p className="text-muted-foreground text-lg mt-3 font-light leading-relaxed max-w-sm mx-auto">
                {getTranslation(selectedLanguage as Language, "tagline")}
              </p>
            </motion.div>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              { icon: Activity, label: "AI Powered" },
              { icon: Shield, label: "Private & Safe" },
              { icon: Heart, label: "24/7 Available" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-soft"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground/80 font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button
              onClick={() => setCurrentScreen("chat")}
              className="w-full h-16 text-lg rounded-2xl shadow-medium hover:shadow-strong transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              size="lg"
            >
              <Sparkles className="mr-3 h-5 w-5" />
              {getTranslation(selectedLanguage as Language, "checkSymptoms")}
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-muted-foreground/50 font-light"
          >
            Your health companion — always here for you ☕
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
