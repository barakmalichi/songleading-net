import Link from "next/link";
import {
  BriefcaseBusiness,
  LibraryBig,
  Menu,
  Music2,
  UsersRound,
  X,
  type LucideIcon
} from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { HomeThemeToggle } from "@/components/HomeThemeToggle";

type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  {
    label: "Toolkit",
    href: "/toolkit",
    icon: LibraryBig,
    description: "Activities, songs, guides, and playlist ideas for leading with a group."
  },
  {
    label: "Community",
    href: "/community",
    icon: UsersRound,
    description: "Events, featured songleaders, shared ideas, and practical ways to stay connected."
  },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: BriefcaseBusiness,
    description: "A private matching pool for hiring a songleader or finding your next role."
  }
];

export function SiteHeader() {
  return (
    <header className="site-header z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-5">
      <Link href="/" className="site-brand flex min-w-0 items-center gap-2.5 font-black tracking-tight" aria-label="Songleading.net home">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
          <Music2 size={19} />
        </span>
        <span className="brand-text min-w-0 leading-tight">
          <span className="block truncate text-base">Songleading.net</span>
          <span className="block whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-white/[0.62]">by Barak Malichi</span>
        </span>
      </Link>

      <nav className="site-icon-nav hidden items-center gap-1.5 md:flex" aria-label="Site sections">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} className="top-nav-link site-nav-info-link" href={item.href} aria-label={item.label}>
              <Icon size={17} />
              <span>{item.label}</span>
              <span className="site-nav-hint" role="tooltip">{item.description}</span>
            </Link>
          );
        })}
      </nav>

      <div className="site-actions flex shrink-0 items-center gap-1.5">
        <Link href="/lineup/index.html" className="top-symbol-button lineup-app-nav-link" aria-label="Lineup App" title="Lineup App">
          <img src="/lineup/icon.svg" alt="" className="lineup-app-mark" />
          <span>Lineup App</span>
        </Link>
        <AuthButton />
        <HomeThemeToggle />
        <details className="site-mobile-menu-root">
          <summary className="site-menu-button top-symbol-button" aria-label="Menu" aria-controls="site-mobile-menu">
            <Menu size={18} className="site-menu-open-icon" />
            <X size={18} className="site-menu-close-icon" />
            <span>Menu</span>
          </summary>
          <div id="site-mobile-menu" className="site-mobile-panel">
            <div className="site-mobile-panel-inner">
              <Link href="/lineup/index.html" className="site-mobile-title-link site-mobile-lineup-link">
                <img src="/lineup/icon.svg" alt="" className="lineup-app-mark" />
                <span>Lineup App</span>
              </Link>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="site-mobile-title-link">
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
