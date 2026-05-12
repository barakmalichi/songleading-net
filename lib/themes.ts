import type { DesignSettings } from "@/types/song";

export type ThemePreset = {
  id: string;
  name: string;
  description?: string;
  settings: Partial<DesignSettings>;
};

export const defaultDesignSettings: DesignSettings = {
  themeId: "dark",
  fontFamily: "Inter, Arial, sans-serif",
  fontSize: 72,
  fontWeight: 700,
  textColor: "#ffffff",
  backgroundColor: "#111827",
  backgroundImage: "",
  textAlign: "center",
  textBoxWidth: 82,
  verticalPlacement: "center",
  horizontalPlacement: "center",
  lineSpacing: 1.15,
  margins: 7,
  showSongTitle: false,
  showSectionTitle: false,
  showSlideNumbers: false,
  showLogo: false,
  logoText: "",
  showCopyrightFooter: true,
  aspectRatio: "16:9"
};

export const boardDesignPresets: ThemePreset[] = [
  {
    id: "sanctuary",
    name: "Sanctuary",
    description: "Dim stage, soft beams, strong lyric contrast.",
    settings: {
      themeId: "sanctuary",
      backgroundColor: "#071013",
      backgroundImage:
        "linear-gradient(115deg, rgba(7,16,19,0.98) 0%, rgba(10,42,49,0.94) 48%, rgba(74,57,31,0.82) 100%), linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 42%)",
      textColor: "#fffdf5",
      fontWeight: 800,
      fontSize: 74,
      lineSpacing: 1.12,
      textBoxWidth: 78,
      margins: 7,
      showCopyrightFooter: true
    }
  },
  {
    id: "daybreak",
    name: "Daybreak",
    description: "Bright, calm board for smaller rooms and teaching moments.",
    settings: {
      themeId: "daybreak",
      backgroundColor: "#f7f4ec",
      backgroundImage:
        "linear-gradient(135deg, rgba(247,244,236,1) 0%, rgba(227,237,232,1) 52%, rgba(202,218,222,1) 100%), linear-gradient(90deg, rgba(18,64,77,0.08) 0%, rgba(18,64,77,0) 58%)",
      textColor: "#11252b",
      fontWeight: 750,
      fontSize: 68,
      lineSpacing: 1.18,
      textBoxWidth: 84,
      margins: 8,
      showCopyrightFooter: true
    }
  }
];

export const themePresets: ThemePreset[] = [
  ...boardDesignPresets,
  {
    id: "white",
    name: "Simple white",
    settings: {
      themeId: "white",
      backgroundColor: "#fbfaf7",
      textColor: "#101820",
      fontWeight: 700
    }
  },
  {
    id: "dark",
    name: "Dark background",
    settings: {
      themeId: "dark",
      backgroundColor: "#111827",
      textColor: "#ffffff",
      fontWeight: 700
    }
  },
  {
    id: "warm",
    name: "Warm worship style",
    settings: {
      themeId: "warm",
      backgroundColor: "#5b3427",
      textColor: "#fff7ed",
      fontWeight: 700
    }
  },
  {
    id: "camp",
    name: "Colorful camp style",
    settings: {
      themeId: "camp",
      backgroundColor: "#0f766e",
      textColor: "#fff7d6",
      fontWeight: 800
    }
  },
  {
    id: "minimal",
    name: "Minimal black and white",
    settings: {
      themeId: "minimal",
      backgroundColor: "#ffffff",
      textColor: "#050505",
      fontWeight: 600
    }
  },
  {
    id: "artistic",
    name: "Artistic background",
    settings: {
      themeId: "artistic",
      backgroundColor: "#263238",
      backgroundImage:
        "linear-gradient(135deg, rgba(17,24,39,0.94), rgba(38,50,56,0.82)), radial-gradient(circle at 25% 20%, rgba(244,162,97,0.55), transparent 34%), radial-gradient(circle at 78% 72%, rgba(42,157,143,0.48), transparent 38%)",
      textColor: "#fffaf0",
      fontWeight: 700
    }
  }
];

export function applyTheme(
  current: DesignSettings,
  themeId: string
): DesignSettings {
  const preset = themePresets.find((theme) => theme.id === themeId);
  return { ...current, ...(preset?.settings ?? {}), themeId };
}
