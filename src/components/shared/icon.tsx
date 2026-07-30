import {
  BriefcaseBusiness, Building2, Calculator, ClipboardList, ConciergeBell, Cpu, Crown, Eye, Factory,
  FileClock, Gauge, GraduationCap, HandCoins, Handshake, HardHat, Headset, HeartPulse, Landmark,
  ListChecks, Megaphone, MessagesSquare, Monitor, PenTool, Search, ShieldCheck, ShoppingBag,
  Stethoscope, Target, Truck, UserCheck, Users, UsersRound, Wallet, type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "briefcase-business": BriefcaseBusiness,
  "building": Building2,
  "calculator": Calculator,
  "clipboard-list": ClipboardList,
  "concierge-bell": ConciergeBell,
  "cpu": Cpu,
  "crown": Crown,
  "eye": Eye,
  "factory": Factory,
  "file-clock": FileClock,
  "gauge": Gauge,
  "graduation-cap": GraduationCap,
  "hand-coins": HandCoins,
  "handshake": Handshake,
  "hard-hat": HardHat,
  "headset": Headset,
  "heart-pulse": HeartPulse,
  "landmark": Landmark,
  "list-checks": ListChecks,
  "megaphone": Megaphone,
  "messages-square": MessagesSquare,
  "monitor": Monitor,
  "pen-tool": PenTool,
  "search": Search,
  "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag,
  "stethoscope": Stethoscope,
  "target": Target,
  "truck": Truck,
  "user-check": UserCheck,
  "users": Users,
  "users-round": UsersRound,
  "wallet": Wallet,
};

/** Resolve a content-file icon slug to a Lucide icon. Falls back to briefcase. */
export function Icon({ name, className }: { name: string; className?: string }) {
  const Comp = iconMap[name] ?? BriefcaseBusiness;
  return <Comp className={className} aria-hidden />;
}

/** Tinted rounded square around a feature icon — the design system's 48px chip. */
export function IconChip({ name, tone = "primary", className }: { name: string; tone?: "primary" | "secondary" | "accent"; className?: string }) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    secondary: "bg-secondary-soft text-secondary",
    accent: "bg-accent-soft text-accent",
  } as const;
  return (
    <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${tones[tone]} ${className ?? ""}`}>
      <Icon name={name} className="size-5" />
    </span>
  );
}
