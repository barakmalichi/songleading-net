export type SectionType =
  | "Verse"
  | "Chorus"
  | "Pre-Chorus"
  | "Bridge"
  | "Tag"
  | "Ending"
  | "Outro"
  | "Call and Response"
  | "Refrain"
  | "Section";

export type SlideAspect = "16:9" | "4:3";

export type TextAlign = "left" | "center" | "right";
export type Placement = "start" | "center" | "end";

export interface DesignSettings {
  themeId: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  backgroundColor: string;
  backgroundImage: string;
  textAlign: TextAlign;
  textBoxWidth: number;
  verticalPlacement: Placement;
  horizontalPlacement: Placement;
  lineSpacing: number;
  margins: number;
  showSongTitle: boolean;
  showSectionTitle: boolean;
  showSlideNumbers: boolean;
  showLogo: boolean;
  logoText: string;
  showCopyrightFooter: boolean;
  aspectRatio: SlideAspect;
}

export interface Section {
  id: string;
  songId: string;
  type: SectionType;
  name: string;
  lines: string[];
  lineBreaksAfter?: number[];
  order: number;
  hidden?: boolean;
  optional?: boolean;
  commonlyRepeated?: boolean;
}

export interface SelectedSectionInstance {
  id: string;
  sectionId: string;
  label: string;
  repeatIndex: number;
  selectedLineIndexes: number[];
}

export interface SavedFlow {
  id: string;
  songId: string;
  name: string;
  selectedSectionInstances: SelectedSectionInstance[];
  selectedLines: Record<string, number[]>;
  slideBreaks: string[];
  designSettings: DesignSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artistOrSource?: string;
  language: string;
  tags: string[];
  notes: string;
  copyrightInfo?: string;
  lyricsRaw: string;
  sections: Section[];
  savedFlows: SavedFlow[];
  createdAt: string;
  updatedAt: string;
}

export interface SlideLine {
  id: string;
  text: string;
  sectionId: string;
  sectionName: string;
  instanceId: string;
  lineIndex: number;
}

export interface LyricSlide {
  id: string;
  title: string;
  sectionNames: string[];
  lines: SlideLine[];
  warning?: string;
}
