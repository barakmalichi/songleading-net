export type CommunityJoinStatus = "comingSoon" | "open";

export type CommunityWhatsapp = {
  status: CommunityJoinStatus;
  label: string;
  href: string;
};

export type CommunityEvent = {
  title: string;
  dateLabel: string;
  format: string;
  description: string;
  linkLabel?: string;
  linkHref?: string;
};

export type CommunityProfile = {
  name: string;
  role: string;
  location: string;
  image?: string;
  instagramUrl?: string;
  videoUrl?: string;
};

export type CommunityContent = {
  whatsapp: CommunityWhatsapp;
  events: CommunityEvent[];
  profiles: CommunityProfile[];
};

export const defaultCommunityContent: CommunityContent = {
  whatsapp: {
    status: "comingSoon",
    label: "WhatsApp group coming soon",
    href: ""
  },
  events: [
    {
      title: "Songleader Community Circle",
      dateLabel: "Date coming soon",
      format: "Online",
      description: "A simple gathering for songleaders to trade ideas, ask real-world questions, and leave with one usable next step."
    },
    {
      title: "Shared Repertoire Night",
      dateLabel: "Date coming soon",
      format: "Online listening session",
      description: "Bring one song that works with a group and hear what other leaders are teaching, adapting, and bringing back."
    },
    {
      title: "Opportunity Prep Session",
      dateLabel: "Seasonal",
      format: "Online workshop",
      description: "A focused session for leaders and organizations getting ready for camps, retreats, services, and summer roles."
    }
  ],
  profiles: []
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeWhatsapp(value: unknown): CommunityWhatsapp {
  const record = isRecord(value) ? value : {};
  const status = record.status === "open" ? "open" : "comingSoon";
  return {
    status,
    label: cleanString(record.label, defaultCommunityContent.whatsapp.label),
    href: status === "open" ? cleanString(record.href, "") : cleanString(record.href, "")
  };
}

function normalizeEvents(value: unknown): CommunityEvent[] {
  const hasCustomEvents = Array.isArray(value);
  const source = hasCustomEvents ? value : defaultCommunityContent.events;
  const events = source
    .map((item): CommunityEvent | null => {
      const record = isRecord(item) ? item : {};
      const rawTitle = cleanString(record.title);
      const title = rawTitle === "Placement Prep Session" ? "Opportunity Prep Session" : rawTitle;
      const description = cleanString(record.description);
      if (!title && !description) return null;
      const linkLabel = cleanString(record.linkLabel);
      const linkHref = cleanString(record.linkHref);
      return {
        title: title || "Community Event",
        dateLabel: cleanString(record.dateLabel, "Date coming soon"),
        format: cleanString(record.format, "Online"),
        description,
        ...(linkLabel ? { linkLabel } : {}),
        ...(linkHref ? { linkHref } : {})
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 12);
  return events.length || hasCustomEvents ? events : defaultCommunityContent.events;
}

function normalizeProfiles(value: unknown): CommunityProfile[] {
  const source = Array.isArray(value) ? value : defaultCommunityContent.profiles;
  return source
    .map((item): CommunityProfile | null => {
      const record = isRecord(item) ? item : {};
      const name = cleanString(record.name);
      if (!name) return null;
      const instagramUrl = cleanString(record.instagramUrl);
      const videoUrl = cleanString(record.videoUrl);
      if (!instagramUrl && !videoUrl) return null;
      const image = cleanString(record.image);
      return {
        name,
        role: cleanString(record.role, "Songleader"),
        location: cleanString(record.location),
        ...(image ? { image } : {}),
        ...(instagramUrl ? { instagramUrl } : {}),
        ...(videoUrl ? { videoUrl } : {})
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 24);
}

export function normalizeCommunityContent(value: Partial<CommunityContent> = {}): CommunityContent {
  const source = isRecord(value) ? value : {};
  return {
    whatsapp: normalizeWhatsapp(source.whatsapp),
    events: normalizeEvents(source.events),
    profiles: normalizeProfiles(source.profiles)
  };
}
