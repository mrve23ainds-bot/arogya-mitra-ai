import { Globe } from "lucide-react";
import { getTranslation, type Language } from "@/lib/translations";
import { motion } from "framer-motion";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="bg-card/70 backdrop-blur-md rounded-3xl p-5 shadow-soft border border-border/40">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          {getTranslation(selectedLanguage as Language, "chooseLanguage")}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onLanguageChange(lang.code)}
            className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-300 overflow-hidden ${
              selectedLanguage === lang.code
                ? "text-primary-foreground shadow-medium"
                : "bg-muted/40 text-foreground hover:bg-muted/70"
            }`}
            style={
              selectedLanguage === lang.code
                ? { background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }
                : undefined
            }
          >
            {selectedLanguage === lang.code && (
              <motion.div
                layoutId="langHighlight"
                className="absolute inset-0 rounded-2xl"
                style={{ background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))` }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="text-lg relative z-10">{lang.flag}</span>
            <span className="text-[11px] font-semibold leading-tight relative z-10">{lang.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
