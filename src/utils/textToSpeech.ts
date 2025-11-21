export class TextToSpeech {
  private currentLanguage: string = "en";
  private currentAudio: HTMLAudioElement | null = null;
  private onEndCallback: (() => void) | null = null;

  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  async speak(text: string, onEnd?: () => void) {
    // Cancel any ongoing speech
    this.stop();

    this.onEndCallback = onEnd || null;

    try {
      // Call the edge function for TTS
      const response = await fetch(
        `https://zvzunrkbcpktahpvptta.supabase.co/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            language: this.currentLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Convert base64 to audio and play
      const audioBlob = this.base64ToBlob(data.audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
      
      await this.currentAudio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    }
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}
