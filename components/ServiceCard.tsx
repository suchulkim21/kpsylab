"use client";

import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

type Theme = "cyan" | "purple";

const THEME_STYLES: Record<
  Theme,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    subtitle: string;
    cta: string;
    gradient: string;
  }
> = {
  cyan: {
    border: "hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    subtitle: "text-cyan-300",
    cta: "text-cyan-400",
    gradient: "from-cyan-600 to-cyan-400",
  },
  purple: {
    border: "hover:border-purple-500/50",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    subtitle: "text-purple-300",
    cta: "text-purple-400",
    gradient: "from-purple-600 to-purple-400",
  },
};

export interface ServiceCardProps {
  theme: Theme;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  link: string;
  intro: string;
  bullets?: string[];
  note?: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
}

export default function ServiceCard({
  theme,
  title,
  subtitle,
  icon: Icon,
  link,
  intro,
  bullets = [],
  note,
  ctaTitle,
  ctaDescription,
  ctaLabel,
}: ServiceCardProps) {
  const styles = THEME_STYLES[theme];
  return (
    <Link
      href={link}
      className={`group block rounded-2xl border border-zinc-800 bg-zinc-900/80 ${styles.border} hover:bg-zinc-900 transition-all duration-300 overflow-hidden`}
    >
      <div className="p-8 md:p-10">
        {/* 헤더: 아이콘 - 타이틀 - 부제 */}
        <div className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center mb-6`}>
          <Icon className={`w-7 h-7 ${styles.iconColor}`} />
        </div>
        <h2 className="typography-h2 text-white mb-3">{title}</h2>
        <p className={`typography-subtitle ${styles.subtitle} mb-6`}>{subtitle}</p>

        {/* 구분선 */}
        <div className="mb-6">
          <h3 className="typography-h3 text-white mb-3">서비스 소개</h3>
          <p className="typography-body leading-relaxed mb-3">{intro}</p>
          {bullets.length > 0 && (
            <ul className="typography-body leading-relaxed mb-3 space-y-1">
              {bullets.map((b, i) => (
                <li key={i}>· {b}</li>
              ))}
            </ul>
          )}
          {note && <p className="typography-caption leading-relaxed">{note}</p>}
        </div>

        {/* 구분선 - CTA */}
        <div className="pt-4 border-t border-zinc-700">
          <h3 className="typography-h3 text-white mb-2">{ctaTitle}</h3>
          <p className="typography-body mb-4">{ctaDescription}</p>
          <span
            className={`inline-flex items-center gap-2 ${styles.cta} font-semibold group-hover:gap-3 transition-all`}
          >
            {ctaLabel}
            <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </div>
      <div
        className={`h-1 bg-gradient-to-r ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      />
    </Link>
  );
}
