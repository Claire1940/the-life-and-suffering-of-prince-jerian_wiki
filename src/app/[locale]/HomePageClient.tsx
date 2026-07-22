"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Church,
  Compass,
  Crown,
  ExternalLink,
  Gamepad2,
  GitBranch,
  Hammer,
  Heart,
  HeartPulse,
  Landmark,
  Lightbulb,
  PlayCircle,
  Repeat,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd"; // 废弃广告位，不接回
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

// 每个属性 / 角色 / 卡片使用的图标（lucide-react，不同图标，禁用 emoji）
const STAT_ICONS = [Swords, Zap, Brain, Shield, Crown, HeartPulse];
const CHARACTER_ICONS = [Crown, Landmark, Church, Users, Heart, Swords];
const ENDING_ICONS = [Landmark, Heart, Crown, Repeat];
const RELEASE_ICONS = [Gamepad2, Hammer, Building2, CalendarDays, PlayCircle, ScrollText];

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.the-life-and-suffering-of-prince-jerian.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Prince Jerian Wiki",
        description:
          "Complete Prince Jerian Wiki covering choices, endings, lore, characters, builds, walkthroughs, and strategy guides for The Life and Suffering of Prince Jerian narrative RPG on PC Steam.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "The Life and Suffering of Prince Jerian",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Prince Jerian Wiki",
        alternateName: "The Life and Suffering of Prince Jerian Wiki",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "The Life and Suffering of Prince Jerian Wiki",
        },
        sameAs: [
          "https://store.steampowered.com/app/2936290/The_Life_and_Suffering_of_Prince_Jerian/",
          "https://steamcommunity.com/app/2936290",
          "https://store.steampowered.com/app/3131940/The_Life_and_Suffering_of_Prince_Jerian_Demo/",
          "https://www.youtube.com/watch?v=NIwZ1D47CQQ",
        ],
      },
      {
        "@type": "VideoGame",
        name: "The Life and Suffering of Prince Jerian",
        gamePlatform: ["PC", "Steam"],
        applicationCategory: "Game",
        genre: ["RPG", "Narrative", "Choices Matter", "Strategy"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        publisher: {
          "@type": "Organization",
          name: "101XP",
        },
        developer: {
          "@type": "Organization",
          name: "Schisma Games",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/2936290/The_Life_and_Suffering_of_Prince_Jerian/",
        },
      },
      {
        "@type": "VideoObject",
        name: "The Life and Suffering of Prince Jerian: Official Launch Trailer",
        description:
          "Official launch trailer for The Life and Suffering of Prince Jerian, the black-and-white narrative RPG published by 101XP and developed by Schisma Games.",
        uploadDate: "2026-07-20",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/NIwZ1D47CQQ",
        url: "https://www.youtube.com/watch?v=NIwZ1D47CQQ",
      },
    ],
  };

  // Walkthrough accordion state
  const [walkExpanded, setWalkExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 卡片 → section id 映射（8 张卡片与下方 8 个模块锚点一一对应）
  const toolsSectionIds = [
    "beginner-guide",
    "walkthrough",
    "endings-guide",
    "choices-guide",
    "characters-guide",
    "stats-and-traits-guide",
    "achievements-guide",
    "release-and-updates",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("walkthrough")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/2936290/The_Life_and_Suffering_of_Prince_Jerian/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="NIwZ1D47CQQ"
              title="The Life and Suffering of Prince Jerian - Official Gameplay Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（前半屏：Hero → 视频 → 模块导航区） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolsSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Beginner Guide (step-by-step) */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianBeginnerGuide"]}
                  locale={locale}
                >
                  {t.modules.princeJerianBeginnerGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.princeJerianBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `princeJerianBeginnerGuide::steps::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {step.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.princeJerianBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Walkthrough (accordion) */}
      <section id="walkthrough" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Compass className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianWalkthrough"]}
                  locale={locale}
                >
                  {t.modules.princeJerianWalkthrough.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianWalkthrough.intro}
            </p>
          </div>
          <div className="scroll-reveal space-y-3">
            {t.modules.princeJerianWalkthrough.chapters.map(
              (chapter: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() =>
                      setWalkExpanded(walkExpanded === index ? null : index)
                    }
                    className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      <ScrollText className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                      {chapter.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${walkExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {walkExpanded === index && (
                    <div className="px-5 pb-5 pl-[3.25rem] text-muted-foreground text-sm md:text-base">
                      {chapter.description}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Endings Guide (card-list) */}
      <section id="endings-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <GitBranch className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianEndingsGuide"]}
                  locale={locale}
                >
                  {t.modules.princeJerianEndingsGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianEndingsGuide.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.princeJerianEndingsGuide.cards.map(
              (card: any, index: number) => {
                const Icon = ENDING_ICONS[index % ENDING_ICONS.length];
                return (
                  <div
                    key={index}
                    className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <h3 className="font-bold text-lg text-[hsl(var(--nav-theme-light))]">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `princeJerianEndingsGuide::cards::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {card.title}
                        </LinkedTitle>
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Module 4: Choices Guide (table) */}
      <section id="choices-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Scale className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianChoicesGuide"]}
                  locale={locale}
                >
                  {t.modules.princeJerianChoicesGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianChoicesGuide.intro}
            </p>
          </div>
          <div className="scroll-reveal overflow-hidden border border-border rounded-xl bg-white/5">
            <div className="hidden md:grid grid-cols-3 bg-[hsl(var(--nav-theme)/0.1)]">
              <div className="p-4 font-semibold">Decision</div>
              <div className="p-4 font-semibold col-span-2">Impact on Prince Jerian's Story</div>
            </div>
            {t.modules.princeJerianChoicesGuide.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 border-t border-border gap-2 md:gap-0"
              >
                <div className="p-4 md:p-5 font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                  <LinkedTitle
                    linkData={
                      moduleLinkMap[`princeJerianChoicesGuide::rows::${index}`]
                    }
                    locale={locale}
                  >
                    {row.choice}
                  </LinkedTitle>
                </div>
                <div className="px-4 pb-4 md:p-5 md:col-span-2 text-sm text-muted-foreground">
                  {row.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Characters Guide (card-list) */}
      <section id="characters-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Users className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianCharactersGuide"]}
                  locale={locale}
                >
                  {t.modules.princeJerianCharactersGuide.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianCharactersGuide.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.princeJerianCharactersGuide.cards.map(
              (card: any, index: number) => {
                const Icon = CHARACTER_ICONS[index % CHARACTER_ICONS.length];
                return (
                  <div
                    key={index}
                    className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <h3 className="font-bold">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `princeJerianCharactersGuide::cards::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {card.title}
                        </LinkedTitle>
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Stats and Traits Guide (tier-grid) */}
      <section id="stats-and-traits-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Brain className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianStatsTraits"]}
                  locale={locale}
                >
                  {t.modules.princeJerianStatsTraits.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianStatsTraits.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.princeJerianStatsTraits.stats.map((stat: any, index: number) => {
              const Icon = STAT_ICONS[index % STAT_ICONS.length];
              const isCritical = stat.rating === "Critical Impact";
              const isHigh = stat.rating === "High Impact";
              const ratingClass = isCritical
                ? "bg-[hsl(var(--nav-theme)/0.2)] border-[hsl(var(--nav-theme)/0.5)] text-[hsl(var(--nav-theme-light))]"
                : isHigh
                  ? "bg-[hsl(var(--nav-theme)/0.12)] border-[hsl(var(--nav-theme)/0.4)] text-[hsl(var(--nav-theme-light))]"
                  : "bg-[hsl(var(--nav-theme)/0.08)] border-[hsl(var(--nav-theme)/0.3)] text-muted-foreground";
              return (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <h3 className="font-bold">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `princeJerianStatsTraits::stats::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {stat.title}
                        </LinkedTitle>
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${ratingClass}`}
                    >
                      {stat.rating}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 7: Achievements Guide (table) */}
      <section id="achievements-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <Trophy className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianAchievements"]}
                  locale={locale}
                >
                  {t.modules.princeJerianAchievements.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianAchievements.intro}
            </p>
          </div>
          <div className="scroll-reveal overflow-hidden border border-border rounded-xl bg-white/5">
            <div className="hidden md:grid grid-cols-3 bg-[hsl(var(--nav-theme)/0.1)]">
              <div className="p-4 font-semibold">Achievement</div>
              <div className="p-4 font-semibold col-span-2">Unlock Requirement</div>
            </div>
            {t.modules.princeJerianAchievements.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 border-t border-border gap-2 md:gap-0"
              >
                <div className="p-4 md:p-5 font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                  <LinkedTitle
                    linkData={
                      moduleLinkMap[`princeJerianAchievements::rows::${index}`]
                    }
                    locale={locale}
                  >
                    {row.title}
                  </LinkedTitle>
                </div>
                <div className="px-4 pb-4 md:p-5 md:col-span-2 text-sm text-muted-foreground">
                  {row.requirement}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Release and Updates (card-list) */}
      <section id="release-and-updates" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
              <CalendarDays className="w-7 h-7 md:w-8 md:h-8 text-[hsl(var(--nav-theme-light))]" />
              <h2 className="text-3xl md:text-5xl font-bold">
                <LinkedTitle
                  linkData={moduleLinkMap["princeJerianReleaseUpdates"]}
                  locale={locale}
                >
                  {t.modules.princeJerianReleaseUpdates.title}
                </LinkedTitle>
              </h2>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.princeJerianReleaseUpdates.intro}
            </p>
          </div>
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.princeJerianReleaseUpdates.cards.map(
              (card: any, index: number) => {
                const Icon = RELEASE_ICONS[index % RELEASE_ICONS.length];
                return (
                  <div
                    key={index}
                    className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <h3 className="font-bold">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `princeJerianReleaseUpdates::cards::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {card.title}
                        </LinkedTitle>
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {card.description}
                    </p>
                  </div>
                );
              },
            )}
          </div>

          {/* 官方渠道外链 */}
          <div className="scroll-reveal mt-8 flex flex-wrap gap-3 justify-center">
            <a
              href="https://store.steampowered.com/app/2936290/The_Life_and_Suffering_of_Prince_Jerian/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <Gamepad2 className="w-4 h-4" /> Steam Store <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://store.steampowered.com/app/3131940/The_Life_and_Suffering_of_Prince_Jerian_Demo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <PlayCircle className="w-4 h-4" /> Free Demo <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://steamcommunity.com/app/2936290"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <Users className="w-4 h-4" /> Steam Community <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=NIwZ1D47CQQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/3131940/The_Life_and_Suffering_of_Prince_Jerian_Demo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/2936290"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/2936290/The_Life_and_Suffering_of_Prince_Jerian/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
