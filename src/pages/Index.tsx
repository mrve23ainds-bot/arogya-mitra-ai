import { useState } from "react";
import { Heart, Sparkles, Activity, Shield, Stethoscope, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import SymptomChat from "@/components/SymptomChat";
import HealthDirectory from "@/components/HealthDirectory";
import EmergencyContacts from "@/components/EmergencyContacts";
import { getTranslation, type Language } from "@/lib/translations";
import { motion } from "framer-motion";
import medicalBg from "@/assets/medical-bg.jpg";

type Screen = "welcome" | "chat" | "directory" | "emergency";

const FloatingOrb = ({ className, delay = 0 }: { className: string; delay?: number }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
    className={className}
  />
);

const Index = () => {
  type Screen = "welcome" | "chat" | "directory" | "emergency";
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  if (currentScreen === "chat") {
    return <SymptomChat language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
  }
  if (currentScreen === "directory") {
    return <HealthDirectory language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
  }
  if (currentScreen === "emergency") {
    return <EmergencyContacts language={selectedLanguage} onBack={() => setCurrentScreen("welcome")} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Soft medical illustration background */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `url(${medicalBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      {/* Warm tint over the image to blend with the palette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" aria-hidden="true" />

      {/* Animated floating orbs */}
      <FloatingOrb className="absolute top-[5%] right-[10%] w-72 h-72 rounded-full bg-primary/[0.07] blur-[80px]" delay={0} />
      <FloatingOrb className="absolute bottom-[10%] left-[5%] w-96 h-96 rounded-full bg-secondary/[0.08] blur-[100px]" delay={2} />
      <FloatingOrb className="absolute top-[50%] left-[60%] w-48 h-48 rounded-full bg-accent/[0.06] blur-[60px]" delay={4} />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-md w-full"
        >
          {/* Icon cluster */}
          <div className="relative flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/10 blur-xl" />
              
              {/* Main icon */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-primary to-secondary rounded-[2rem] flex items-center justify-center shadow-strong">
                <Heart className="text-primary-foreground fill-primary-foreground/30" style={{ width: 44, height: 44 }} />
              </div>
              
              {/* Floating mini badges */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -top-2 -right-3 w-10 h-10 bg-card border-2 border-border/50 rounded-2xl flex items-center justify-center shadow-medium"
              >
                <Stethoscope className="w-5 h-5 text-primary" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -bottom-2 -left-3 w-9 h-9 bg-card border-2 border-border/50 rounded-xl flex items-center justify-center shadow-medium"
              >
                <Activity className="w-4 h-4 text-secondary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-center mb-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight mb-3">
              {getTranslation(selectedLanguage as Language, "appName")}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-xs mx-auto">
              {getTranslation(selectedLanguage as Language, "tagline")}
            </p>
          </motion.div>

          {/* Feature cards row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex justify-center gap-3 mb-8"
          >
            {[
              { icon: Sparkles, label: "AI Powered", color: "text-primary" },
              { icon: Shield, label: "Private & Safe", color: "text-secondary" },
              { icon: Heart, label: "24/7 Care", color: "text-accent" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex flex-col items-center gap-2 bg-card/70 backdrop-blur-md border border-border/40 rounded-2xl px-4 py-3.5 shadow-soft cursor-default"
              >
                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold tracking-wide uppercase">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-6"
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
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentScreen("chat")}
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-strong hover:shadow-strong transition-all relative overflow-hidden group"
                size="lg"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--accent)) 100%)`,
                  backgroundSize: '200% 200%',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Sparkles className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">{getTranslation(selectedLanguage as Language, "checkSymptoms")}</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <div className="h-px w-12 bg-border" />
            <p className="text-xs text-muted-foreground/50 font-light">
              Your health companion ☕
            </p>
            <div className="h-px w-12 bg-border" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
