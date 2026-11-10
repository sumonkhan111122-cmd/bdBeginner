import {
  BarChart3, BookOpen, Bot, Building2, CheckCircle, CheckCircle2, Code2,
  Crown, DownloadCloud, FileCode, FileText, Film, Folder, FolderArchive,
  FolderOpen, Gauge, Globe, GraduationCap, Headphones, Image, Infinity,
  Laptop, Layers, Layout, LayoutDashboard, LifeBuoy, Mail, Monitor,
  MousePointerClick, Package, Palette, PenLine, Puzzle, RefreshCw, Rocket,
  Server, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, TrendingUp,
  Truck, Wrench, Zap, type LucideIcon,
} from 'lucide-react';

// Keep data-driven icons without including Lucide's entire icon library in the storefront.
const icons: Record<string, LucideIcon> = {
  BarChart3, BookOpen, Bot, Building2, CheckCircle, CheckCircle2, Code2,
  Crown, DownloadCloud, FileCode, FileText, Film, Folder, FolderArchive,
  FolderOpen, Gauge, Globe, GraduationCap, Headphones, Image, Infinity,
  Laptop, Layers, Layout, LayoutDashboard, LifeBuoy, Mail, Monitor,
  MousePointerClick, Package, Palette, PenLine, Puzzle, RefreshCw, Rocket,
  Server, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, TrendingUp,
  Truck, Wrench, Zap,
};

export function getIcon(name: string, fallback: LucideIcon = Package): LucideIcon {
  return Object.prototype.hasOwnProperty.call(icons, name) ? icons[name] : fallback;
}
