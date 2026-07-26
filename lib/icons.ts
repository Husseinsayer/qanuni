/**
 * Shared icon map — single source of truth for all Lucide icon name→component mappings.
 * Used by admin-data, laws pages, services, toast, notifications, and use-site-data.
 */
import {
  Scale,
  Car,
  Building2,
  Users,
  HeartHandshake,
  Briefcase,
  Landmark,
  FileText,
  ShieldCheck,
  Gavel,
  Network,
  Sparkles,
  BookOpen,
  ScrollText,
  Star,
  type LucideIcon,
} from "lucide-react";

export type IconName =
  | "Scale"
  | "Car"
  | "Building2"
  | "Users"
  | "HeartHandshake"
  | "Briefcase"
  | "Landmark"
  | "FileText"
  | "ShieldCheck"
  | "Gavel"
  | "Network"
  | "Sparkles"
  | "BookOpen"
  | "ScrollText"
  | "Star";

/** Maps icon name strings (stored in data) to Lucide components */
export const iconMap: Record<string, LucideIcon> = {
  Scale,
  Car,
  Building2,
  Users,
  HeartHandshake,
  Briefcase,
  Landmark,
  FileText,
  ShieldCheck,
  Gavel,
  Network,
  Sparkles,
  BookOpen,
  ScrollText,
  Star,
};

/** All available icon names (for UI pickers) */
export const iconNames: string[] = Object.keys(iconMap);

/** Resolve an icon name to its component, falling back to Scale */
export function resolveIcon(name: string | undefined): LucideIcon {
  return (name && iconMap[name]) || Scale;
}

/**
 * Serialize a Lucide component back to its string name.
 * Useful for persisting user-selected icons to storage.
 */
export function serializeIcon(icon: LucideIcon | React.ComponentType<{ className?: string }>): string {
  for (const [name, comp] of Object.entries(iconMap)) {
    if (comp === icon) return name;
  }
  return "Scale";
}
