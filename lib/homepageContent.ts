export type HomepageAboutContent = {
  name: string;
  image: string;
  title: string;
  text: string;
  highlights: string[];
};

export type HomepageCardContent = {
  title: string;
  text: string;
};

export type HomepageContent = {
  hero: {
    image: string;
    headlinePrefix: string;
    shineWord: string;
    subheadline: string;
    text: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  resources: {
    image: string;
    imageEyebrow: string;
    imageTitle: string;
    badges: string[];
    eyebrow: string;
    title: string;
    text: string;
    cards: HomepageCardContent[];
  };
  training: {
    image: string;
    eyebrow: string;
    title: string;
    text: string;
    secondText: string;
    pills: string[];
  };
  tools: {
    eyebrow: string;
    title: string;
    text: string;
    buttonLabel: string;
    previewEyebrow: string;
    previewTitle: string;
  };
  community: {
    image: string;
    eyebrow: string;
    title: string;
    text: string;
    secondText: string;
  };
  about: HomepageAboutContent;
  footer: {
    text: string;
    note: string;
  };
};

export const homepageAboutStorageKey = "songleading-homepage-about";
export const homepageContentStorageKey = "songleading-homepage-content";

const previousAboutImagePath = "/media/generated/barak-about-portrait.png";
const previousInlineAboutImagePrefix = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdp";
const previousHeroText = "Plan, teach, gather ideas, and go on stage more prepared.";
const previousHeroPrimaryLabel = "Start Planning";
const previousHeroSecondaryLabel = "Browse ideas";
const previousToolsTitle = "Plan the moment before you lead it.";
const previousToolsText = "The Lineup app lives here as a working tool: song bank, show order, notes, capo, keys, exports, and connected lyric slides.";
const previousToolsButtonLabel = "Start Planning";

export const defaultHomepageAboutContent: HomepageAboutContent = {
  name: "Barak Malichi",
  image: "/media/generated/barak-about-live.jpg",
  title: "Songleader, music producer, and builder of modern Jewish music experiences.",
  text: "Barak Malichi is an experienced songleader working across many songleading frameworks, touring throughout the US and Canada, serving as JAFI's head songleader, producing music, and helping communities turn gatherings into moments of real connection.",
  highlights: ["JAFI head songleader", "US + Canada touring", "Music producer", "Mentoring programs"]
};

export const defaultHomepageContent: HomepageContent = {
  hero: {
    image: "/media/generated/hero-songleader.png",
    headlinePrefix: "The home of modern",
    shineWord: "SONGLEADING",
    subheadline: "Plan smarter. Lead better. Make them sing.",
    text: "Build setlists in Lineup, browse songleading ideas, and go on stage more prepared.",
    primaryLabel: "Open Lineup",
    secondaryLabel: "Browse Toolkit"
  },
  resources: {
    image: "/media/generated/songleader-practice-resources.png",
    imageEyebrow: "Ready moments",
    imageTitle: "A resource desk before you lead.",
    badges: ["Plan", "Build", "Sing"],
    eyebrow: "Resources",
    title: "Useful ideas, ready to lead.",
    text: "Fast prompts for planning, teaching, opening, and keeping the energy clear.",
    cards: [
      {
        title: "Setlist planning",
        text: "Shape a flow that feels musical, useful, and easy to lead."
      },
      {
        title: "Song ideas",
        text: "Find stronger options for the room, age group, and moment."
      },
      {
        title: "Community building",
        text: "Use music to help people notice each other and join in."
      },
      {
        title: "Hebrew + English flow",
        text: "Move naturally between language, meaning, and participation."
      },
      {
        title: "Service structure",
        text: "Create simple arcs for prayer, gathering, teaching, and joy."
      },
      {
        title: "Games and activities",
        text: "Bring groups into the music before the first big sing."
      }
    ]
  },
  training: {
    image: "/media/generated/training-workshop.png",
    eyebrow: "Training",
    title: "Master Songleading",
    text: "The work is musical, social, spiritual, and practical. This space is built for the real-life parts of leading: choosing the right song, teaching it clearly, and knowing what the group needs next.",
    secondText: "Training should feel usable right away: better song choices, stronger teaching moments, cleaner transitions, and a leader who can read the room without losing the music.",
    pills: ["Camps", "Youth groups", "Schools", "Services", "Retreats", "Staff training"]
  },
  tools: {
    eyebrow: "Tools",
    title: "Use Lineup before you lead.",
    text: "Build the setlist, pull from your song bank, add notes, prep keys and capo, export, and make connected lyric slides.",
    buttonLabel: "Open Lineup",
    previewEyebrow: "Lineup",
    previewTitle: "Friday Night Set"
  },
  community: {
    image: "/media/generated/community-circle.png",
    eyebrow: "Community",
    title: "Every voice\nis a part of something bigger.",
    text: "Songleading is about helping people hear themselves together. This is about togetherness: warm, useful, and built around real gatherings.",
    secondText: "The strongest moments usually feel simple from the outside: a song lands, people join, and the gathering starts to feel like it belongs to everyone."
  },
  about: defaultHomepageAboutContent,
  footer: {
    text: "Songleading.net · by Barak Malichi",
    note: "Tools and resources for professional songleaders."
  }
};

const previousFooterNote = "Tools and resources for the next gathering.";

function cleanString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanStringWithPrevious(value: unknown, fallback: string, previousValues: string[] = []) {
  const cleaned = cleanString(value, fallback);
  return previousValues.includes(cleaned) ? fallback : cleaned;
}

function cleanAboutImage(value: unknown) {
  const image = cleanString(value, defaultHomepageAboutContent.image);
  if (image === previousAboutImagePath || image.startsWith(previousInlineAboutImagePrefix)) {
    return defaultHomepageAboutContent.image;
  }
  return image;
}

function cleanFooterNote(value: unknown) {
  const note = cleanString(value, defaultHomepageContent.footer.note);
  return note === previousFooterNote ? defaultHomepageContent.footer.note : note;
}

function cleanStringArray(value: unknown, fallback: string[], maxItems = 8) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean).slice(0, maxItems);
  return items.length ? items : fallback;
}

function cleanCards(value: unknown, fallback: HomepageCardContent[]) {
  if (!Array.isArray(value)) return fallback;
  const cards = value
    .map((item, index) => {
      const fallbackItem = fallback[index] || { title: "", text: "" };
      const record = item && typeof item === "object" && !Array.isArray(item) ? item as Partial<HomepageCardContent> : {};
      return {
        title: cleanString(record.title, fallbackItem.title),
        text: cleanString(record.text, fallbackItem.text)
      };
    })
    .filter((item) => item.title || item.text)
    .slice(0, 8);
  return cards.length ? cards : fallback;
}

function cleanSection<T extends object>(value: unknown): Partial<T> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Partial<T> : {};
}

export function normalizeHomepageAboutContent(value: Partial<HomepageAboutContent> = {}): HomepageAboutContent {
  return {
    name: cleanString(value.name, defaultHomepageAboutContent.name),
    image: cleanAboutImage(value.image),
    title: cleanString(value.title, defaultHomepageAboutContent.title),
    text: cleanString(value.text, defaultHomepageAboutContent.text),
    highlights: cleanStringArray(value.highlights, defaultHomepageAboutContent.highlights, 6)
  };
}

export function normalizeHomepageContent(value: Partial<HomepageContent> = {}): HomepageContent {
  const source = cleanSection<HomepageContent>(value);
  const hero = cleanSection<HomepageContent["hero"]>(source.hero);
  const resources = cleanSection<HomepageContent["resources"]>(source.resources);
  const training = cleanSection<HomepageContent["training"]>(source.training);
  const tools = cleanSection<HomepageContent["tools"]>(source.tools);
  const community = cleanSection<HomepageContent["community"]>(source.community);
  const footer = cleanSection<HomepageContent["footer"]>(source.footer);

  return {
    hero: {
      image: cleanString(hero.image, defaultHomepageContent.hero.image),
      headlinePrefix: cleanString(hero.headlinePrefix, defaultHomepageContent.hero.headlinePrefix),
      shineWord: cleanString(hero.shineWord, defaultHomepageContent.hero.shineWord),
      subheadline: cleanString(hero.subheadline, defaultHomepageContent.hero.subheadline),
      text: cleanStringWithPrevious(hero.text, defaultHomepageContent.hero.text, [previousHeroText]),
      primaryLabel: cleanStringWithPrevious(hero.primaryLabel, defaultHomepageContent.hero.primaryLabel, [previousHeroPrimaryLabel]),
      secondaryLabel: cleanStringWithPrevious(hero.secondaryLabel, defaultHomepageContent.hero.secondaryLabel, [previousHeroSecondaryLabel])
    },
    resources: {
      image: cleanString(resources.image, defaultHomepageContent.resources.image),
      imageEyebrow: cleanString(resources.imageEyebrow, defaultHomepageContent.resources.imageEyebrow),
      imageTitle: cleanString(resources.imageTitle, defaultHomepageContent.resources.imageTitle),
      badges: cleanStringArray(resources.badges, defaultHomepageContent.resources.badges, 4),
      eyebrow: cleanString(resources.eyebrow, defaultHomepageContent.resources.eyebrow),
      title: cleanString(resources.title, defaultHomepageContent.resources.title),
      text: cleanString(resources.text, defaultHomepageContent.resources.text),
      cards: cleanCards(resources.cards, defaultHomepageContent.resources.cards)
    },
    training: {
      image: cleanString(training.image, defaultHomepageContent.training.image),
      eyebrow: cleanString(training.eyebrow, defaultHomepageContent.training.eyebrow),
      title: cleanString(training.title, defaultHomepageContent.training.title),
      text: cleanString(training.text, defaultHomepageContent.training.text),
      secondText: cleanString(training.secondText, defaultHomepageContent.training.secondText),
      pills: cleanStringArray(training.pills, defaultHomepageContent.training.pills, 8)
    },
    tools: {
      eyebrow: cleanString(tools.eyebrow, defaultHomepageContent.tools.eyebrow),
      title: cleanStringWithPrevious(tools.title, defaultHomepageContent.tools.title, [previousToolsTitle]),
      text: cleanStringWithPrevious(tools.text, defaultHomepageContent.tools.text, [previousToolsText]),
      buttonLabel: cleanStringWithPrevious(tools.buttonLabel, defaultHomepageContent.tools.buttonLabel, [previousToolsButtonLabel]),
      previewEyebrow: cleanString(tools.previewEyebrow, defaultHomepageContent.tools.previewEyebrow),
      previewTitle: cleanString(tools.previewTitle, defaultHomepageContent.tools.previewTitle)
    },
    community: {
      image: cleanString(community.image, defaultHomepageContent.community.image),
      eyebrow: cleanString(community.eyebrow, defaultHomepageContent.community.eyebrow),
      title: cleanString(community.title, defaultHomepageContent.community.title),
      text: cleanString(community.text, defaultHomepageContent.community.text),
      secondText: cleanString(community.secondText, defaultHomepageContent.community.secondText)
    },
    about: normalizeHomepageAboutContent(source.about || {}),
    footer: {
      text: cleanString(footer.text, defaultHomepageContent.footer.text),
      note: cleanFooterNote(footer.note)
    }
  };
}
