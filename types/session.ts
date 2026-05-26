import type { DesignSettings, SelectedSectionInstance } from "./song";

export type SlidesStatus = "no-slides" | "slides-ready" | "needs-review"; // needs-review is accepted only for legacy saved data.

export interface SessionSong {
  id: string;
  sessionId: string;
  songId: string;
  slideSongId?: string;
  slideFlowId?: string;
  slidesStatus?: SlidesStatus;
  savedFlowId?: string;
  order: number;
  customSectionFlow?: SelectedSectionInstance[];
  customSlideBreaks?: string[];
  designOverrides?: Partial<DesignSettings>;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  notes: string;
  sessionSongs: SessionSong[];
  globalDesignSettings: DesignSettings;
  createdAt: string;
  updatedAt: string;
}
