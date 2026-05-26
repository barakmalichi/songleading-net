export type ToolkitKind = "article" | "activity" | "song";
export type ToolkitStatus = "draft" | "pending" | "published" | "rejected";
export type ToolkitSource = "official" | "community";

export const toolkitTitle = "Songleader Toolkit";
export const toolkitSubtitle = "Articles, activities, song ideas, and curated resources for leaders who make groups sing together.";
export const spotifyPlaylistUrl = "https://open.spotify.com/playlist/36Pl6qx1YkfsrI9EqjYNhz?si=1DxTXUeQSFy7-LKhXnr7rQ&pi=K8mTZj1BQvGqP";

export type ToolkitBase = {
  id: string;
  kind: ToolkitKind;
  slug: string;
  title: string;
  excerpt: string;
  status: ToolkitStatus;
  sourceType: ToolkitSource;
  categories: string[];
  tags: string[];
  heroImage?: string;
  submitterName?: string;
  submitterEmail?: string;
  authorId?: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export type ToolkitArticle = ToolkitBase & {
  kind: "article";
  body: string;
  mediaUrl?: string;
};

export type ToolkitRelatedLink = {
  label: string;
  url: string;
};

export type ToolkitActivity = ToolkitBase & {
  kind: "activity";
  description: string;
  goals: string;
  equipment: string;
  duration: string;
  ageGroup: string;
  musicalLevel: string;
  groupSize: string;
  energyLevel: string;
  location: string;
  preparation: string;
  steps: string[];
  relatedSongs: string[];
  relatedLinks: ToolkitRelatedLink[];
};

export type ToolkitSong = ToolkitBase & {
  kind: "song";
  artist: string;
  context: string;
  whyTeach: string;
  ageGroup: string;
  musicalLevel: string;
  energyLevel: string;
  setting: string;
  youtubeUrl?: string;
  externalLinks: string[];
  teachingNotes: string;
  rightsConfirmed: boolean;
  lyricsChords?: string;
};

export type ToolkitItem = ToolkitArticle | ToolkitActivity | ToolkitSong;

export type ToolkitStats = {
  articles: number;
  activities: number;
  songs: number;
  pending: number;
};

export const toolkitKindLabels: Record<ToolkitKind, string> = {
  article: "Articles / Guides",
  activity: "Activity Library",
  song: "Songs to Teach"
};

export const toolkitKindPaths: Record<ToolkitKind, string> = {
  article: "/toolkit/articles",
  activity: "/toolkit/activities",
  song: "/toolkit/songs"
};

export const defaultToolkitItems: ToolkitItem[] = [
  {
    id: "seed_article_opening-song-session",
    kind: "article",
    slug: "opening-a-song-session-with-confidence",
    title: "Opening a Song Session With Confidence",
    excerpt: "A practical guide for choosing the first five minutes: tone, invitation, and the first song that gets people with you.",
    status: "published",
    sourceType: "official",
    categories: ["Songleading", "Camp Culture"],
    tags: ["opening", "energy", "teaching"],
    heroImage: "/media/generated/songleader-practice-resources.png",
    body: "## Start before the first chord\n\nThe first moment is not only musical. It tells the group what kind of room they are entering.\n\n- Choose a song that most people can join quickly.\n- Teach one thing at a time.\n- Let the first success be small and obvious.\n\n## A simple opening arc\n\n1. Gather attention with warmth.\n2. Sing something familiar.\n3. Add one participation cue.\n4. Move into the next song before the energy drops.",
    mediaUrl: "",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    publishedAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "seed_activity_echo-build",
    kind: "activity",
    slug: "echo-build",
    title: "Echo Build",
    excerpt: "A quick call-and-response activity that turns a new melody into a group-owned song.",
    status: "published",
    sourceType: "official",
    categories: ["Music Education", "Activity Building"],
    tags: ["call and response", "warmup", "camp"],
    heroImage: "/media/generated/training-workshop.png",
    description: "Teach a melody in small echo pieces, then let groups own different phrases and rebuild the song together.",
    goals: "Build confidence, listening, group energy, and fast participation.",
    equipment: "Guitar or piano optional. Works a cappella.",
    duration: "8-12 minutes",
    ageGroup: "Grades 3 and up",
    musicalLevel: "Beginner friendly",
    groupSize: "8-150",
    energyLevel: "Medium",
    location: "Indoor or outdoor",
    preparation: "Pick a song with short repeatable phrases.",
    steps: [
      "Sing one short phrase and have the group echo it.",
      "Repeat with a second phrase and connect the two.",
      "Split the room into two groups and assign each one a phrase.",
      "Bring everyone back together for the full chorus.",
      "Add dynamics, claps, or movement once the melody is secure."
    ],
    relatedSongs: ["Simple chorus songs", "Nigunim", "Camp favorites"],
    relatedLinks: [],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    publishedAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "seed_song_od-yavo",
    kind: "song",
    slug: "od-yavo-shalom-aleinu",
    title: "Od Yavo Shalom Aleinu",
    excerpt: "A strong communal singing option for mixed-age groups, circles, and high-energy closing moments.",
    status: "published",
    sourceType: "official",
    categories: ["Jewish Prayer Music", "Communal Singing"],
    tags: ["peace", "circle", "camp"],
    heroImage: "/media/generated/community-circle.png",
    artist: "Traditional / contemporary camp repertoire",
    context: "Works well for song sessions, closing circles, Israel programs, and moments about peace or togetherness.",
    whyTeach: "The chorus is short, repetitive, and easy to layer with claps, harmony, and movement.",
    ageGroup: "All ages",
    musicalLevel: "Beginner friendly",
    energyLevel: "High",
    setting: "Song session, campfire, service closing",
    youtubeUrl: "",
    externalLinks: [],
    teachingNotes: "Start with the chorus slowly, then add tempo and percussion once the room has the words.",
    rightsConfirmed: false,
    lyricsChords: "",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    publishedAt: "2026-05-01T00:00:00.000Z"
  }
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "toolkit-item";
}

function nowIso() {
  return new Date().toISOString();
}

export function makeToolkitId(kind: ToolkitKind) {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 12);
  return `${kind}_${random}`;
}

export function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function cleanList(value: unknown, fallback: string[] = [], maxItems = 24) {
  if (Array.isArray(value)) {
    const items = value.map((item) => cleanText(item)).filter(Boolean).slice(0, maxItems);
    return items.length ? items : fallback;
  }
  if (typeof value === "string") {
    const items = value.split(/\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, maxItems);
    return items.length ? items : fallback;
  }
  return fallback;
}

export function cleanRelatedLinks(value: unknown, fallback: ToolkitRelatedLink[] = [], maxItems = 12) {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const input = item as Record<string, unknown>;
      const label = cleanText(input.label || input.description, "");
      const url = cleanText(input.url || input.link, "");
      if (!label || !url) return null;
      return { label, url };
    })
    .filter((item): item is ToolkitRelatedLink => Boolean(item))
    .slice(0, maxItems);
  return links.length ? links : fallback;
}

export function linesToList(value: string) {
  return cleanList(value.split("\n"));
}

export function listToLines(value: string[]) {
  return value.join("\n");
}

export function isToolkitKind(value: string | null | undefined): value is ToolkitKind {
  return value === "article" || value === "activity" || value === "song";
}

export function routeKindToToolkitKind(value: string | null | undefined): ToolkitKind | null {
  if (value === "articles") return "article";
  if (value === "activities") return "activity";
  if (value === "songs") return "song";
  return isToolkitKind(value) ? value : null;
}

function cleanStatus(value: unknown, fallback: ToolkitStatus): ToolkitStatus {
  return value === "draft" || value === "pending" || value === "published" || value === "rejected" ? value : fallback;
}

function cleanSource(value: unknown, fallback: ToolkitSource): ToolkitSource {
  return value === "community" || value === "official" ? value : fallback;
}

function cleanBase(input: Record<string, unknown>, kind: ToolkitKind, fallbackStatus: ToolkitStatus): ToolkitBase {
  const title = cleanText(input.title, kind === "song" ? "Untitled song" : kind === "activity" ? "Untitled activity" : "Untitled article");
  const createdAt = cleanText(input.createdAt || input.created_at, nowIso());
  const updatedAt = cleanText(input.updatedAt || input.updated_at, nowIso());
  const status = cleanStatus(input.status, fallbackStatus);
  return {
    id: cleanText(input.id, makeToolkitId(kind)),
    kind,
    slug: slugify(cleanText(input.slug, title)),
    title,
    excerpt: cleanText(input.excerpt || input.description, ""),
    status,
    sourceType: cleanSource(input.sourceType || input.source_type, "official"),
    categories: cleanList(input.categories, []),
    tags: cleanList(input.tags, []),
    heroImage: cleanText(input.heroImage || input.hero_image, ""),
    submitterName: cleanText(input.submitterName || input.submitter_name, ""),
    submitterEmail: cleanText(input.submitterEmail || input.submitter_email, ""),
    authorId: cleanText(input.authorId || input.author_id, ""),
    authorEmail: cleanText(input.authorEmail || input.author_email, ""),
    createdAt,
    updatedAt,
    publishedAt: status === "published" ? cleanText(input.publishedAt || input.published_at, createdAt) : cleanText(input.publishedAt || input.published_at, "")
  };
}

export function normalizeToolkitItem(value: unknown, fallbackKind?: ToolkitKind, fallbackStatus: ToolkitStatus = "published"): ToolkitItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const kind = isToolkitKind(String(input.kind || "")) ? input.kind as ToolkitKind : fallbackKind;
  if (!kind) return null;
  const base = cleanBase(input, kind, fallbackStatus);

  if (kind === "article") {
    return {
      ...base,
      kind,
      body: cleanText(input.body, ""),
      mediaUrl: cleanText(input.mediaUrl || input.media_url, "")
    };
  }

  if (kind === "activity") {
    const description = cleanText(input.description, base.excerpt);
    return {
      ...base,
      kind,
      excerpt: base.excerpt || description,
      description,
      goals: cleanText(input.goals, ""),
      equipment: cleanText(input.equipment, ""),
      duration: cleanText(input.duration, ""),
      ageGroup: cleanText(input.ageGroup || input.age_group, ""),
      musicalLevel: cleanText(input.musicalLevel || input.musical_level, ""),
      groupSize: cleanText(input.groupSize || input.group_size, ""),
      energyLevel: cleanText(input.energyLevel || input.energy_level, ""),
      location: cleanText(input.location, ""),
      preparation: cleanText(input.preparation, ""),
      steps: cleanList(input.steps, []),
      relatedSongs: cleanList(input.relatedSongs || input.related_songs, []),
      relatedLinks: cleanRelatedLinks(input.relatedLinks || input.related_links, [])
    };
  }

  const rightsConfirmed = input.rightsConfirmed === true || input.rights_confirmed === true;
  return {
    ...base,
    kind,
    artist: cleanText(input.artist, ""),
    context: cleanText(input.context, ""),
    whyTeach: cleanText(input.whyTeach || input.why_teach, ""),
    ageGroup: cleanText(input.ageGroup || input.age_group, ""),
    musicalLevel: cleanText(input.musicalLevel || input.musical_level, ""),
    energyLevel: cleanText(input.energyLevel || input.energy_level, ""),
    setting: cleanText(input.setting, ""),
    youtubeUrl: cleanText(input.youtubeUrl || input.youtube_url, ""),
    externalLinks: cleanList(input.externalLinks || input.external_links, []),
    teachingNotes: cleanText(input.teachingNotes || input.teaching_notes, ""),
    rightsConfirmed,
    lyricsChords: rightsConfirmed ? cleanText(input.lyricsChords || input.lyrics_chords, "") : ""
  };
}

export function normalizeToolkitItems(value: unknown) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item) => normalizeToolkitItem(item))
    .filter((item): item is ToolkitItem => Boolean(item))
    .sort((first, second) => Date.parse(second.publishedAt || second.updatedAt) - Date.parse(first.publishedAt || first.updatedAt));
}

export function publicToolkitItems(items: ToolkitItem[]) {
  return items.filter((item) => item.status === "published");
}

export function summarizeToolkit(items: ToolkitItem[]): ToolkitStats {
  return {
    articles: items.filter((item) => item.kind === "article" && item.status === "published").length,
    activities: items.filter((item) => item.kind === "activity" && item.status === "published").length,
    songs: items.filter((item) => item.kind === "song" && item.status === "published").length,
    pending: items.filter((item) => item.status === "pending").length
  };
}

export function mergeToolkitItems(primary: ToolkitItem[], fallback = defaultToolkitItems) {
  const seen = new Set<string>();
  return [...primary, ...fallback]
    .filter((item) => {
      const key = `${item.kind}:${item.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((first, second) => Date.parse(second.publishedAt || second.updatedAt) - Date.parse(first.publishedAt || first.updatedAt));
}
