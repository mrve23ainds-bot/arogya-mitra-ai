import { Globe } from "lucide-react";
import { getTranslation, type Language } from "@/lib/translations";

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
    <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-5 shadow-soft border border-border/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          {getTranslation(selectedLanguage as Language, "chooseLanguage")}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-200 ${
              selectedLanguage === lang.code
                ? "bg-primary text-primary-foreground shadow-medium scale-[1.02]"
                : "bg-muted/50 text-foreground hover:bg-muted hover:scale-[1.01]"
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-xs font-medium leading-tight">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
