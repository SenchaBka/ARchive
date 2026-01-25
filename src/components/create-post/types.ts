export interface PostData {
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  media: File | null;
  audio: File | null;
  audioUrl: string | null; // URL from cloud storage after upload
  radius: number;
  voiceId: string | null; // Voice ID for TTS generation
}
