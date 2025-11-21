// Map language codes to speech synthesis language codes with Indian accent
const languageVoiceMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  te: "te-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
  as: "as-IN",
};

export class TextToSpeech {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentLanguage: string = "en";

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  speak(text: string, onEnd?: () => void) {
    // Cancel any ongoing speech
    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = languageVoiceMap[this.currentLanguage] || "en-IN";
    this.utterance.rate = 0.9;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    if (onEnd) {
      this.utterance.onend = onEnd;
    }

    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.synthesis.speak(this.utterance!);
      }, { once: true });
    } else {
      this.synthesis.speak(this.utterance);
    }
  }

  stop() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  pause() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}
