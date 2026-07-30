import {
  Award, BarChart3, Bell, Briefcase, Building2, Calendar, CircleHelp, Factory, FileText, Globe, Heart,
  Inbox, LayoutDashboard, Mail, Newspaper, PlusCircle, Quote, Send, Settings, Shield, Tags, Target,
  User, Users, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  heart: Heart,
  calendar: Calendar,
  user: User,
  bell: Bell,
  settings: Settings,
  "plus-circle": PlusCircle,
  briefcase: Briefcase,
  inbox: Inbox,
  building: Building2,
  "bar-chart": BarChart3,
  users: Users,
  target: Target,
  mail: Mail,
  newspaper: Newspaper,
  quote: Quote,
  send: Send,
  shield: Shield,
  globe: Globe,
  "circle-help": CircleHelp,
  factory: Factory,
  award: Award,
  tags: Tags,
};

export function DashboardIcon({ name, className }: { name: string; className?: string }) {
  const Comp = map[name] ?? LayoutDashboard;
  return <Comp className={className} aria-hidden />;
}
