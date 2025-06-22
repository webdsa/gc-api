export interface Live {
  enabled: boolean;
  title: string;
  videoID: string;
  description: string;
}

export interface ACF {
  year: number;
  live: Live;
}

export interface FormData {
  acf: ACF;
} 