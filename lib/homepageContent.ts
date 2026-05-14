export type HomepageAboutContent = {
  name: string;
  image: string;
  title: string;
  text: string;
  highlights: string[];
};

export const homepageAboutStorageKey = "songleading-homepage-about";

export const defaultHomepageAboutContent: HomepageAboutContent = {
  name: "Barak Malichi",
  image: "/media/generated/barak-about-portrait.png",
  title: "Songleader, music producer, and builder of modern Jewish music experiences.",
  text: "Barak Malichi is an experienced songleader working across many songleading frameworks, touring throughout the US and Canada, serving as JAFI's head songleader, producing music, and helping communities turn gatherings into moments of real connection.",
  highlights: ["JAFI head songleader", "US + Canada touring", "Music producer", "Mentoring programs"]
};

export function normalizeHomepageAboutContent(value: Partial<HomepageAboutContent>): HomepageAboutContent {
  return {
    name: value.name?.trim() || defaultHomepageAboutContent.name,
    image: value.image?.trim() || defaultHomepageAboutContent.image,
    title: value.title?.trim() || defaultHomepageAboutContent.title,
    text: value.text?.trim() || defaultHomepageAboutContent.text,
    highlights: Array.isArray(value.highlights) && value.highlights.length
      ? value.highlights.map((item) => item.trim()).filter(Boolean).slice(0, 6)
      : defaultHomepageAboutContent.highlights
  };
}
