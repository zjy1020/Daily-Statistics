import {
  UtensilsCrossed, Cookie, Apple, Coffee, Wine, ShoppingBag, Shirt,
  Sparkles, Car, Smartphone, Zap, Landmark, Sofa, Film, Gamepad2,
  Trophy, Dumbbell, Beer, BookOpen, Monitor, HeartPulse, Cat, Scissors,
  Gift, Backpack, Wrench, Package, Baby, ShieldCheck, MoreHorizontal,
  Briefcase, Award, Laptop, TrendingUp, TrendingDown, Building, Undo2,
  Receipt, PenLine, Gem, Banknote, ChartPie,
  Star, Tag, Bell, Flag, Crown, Flame, Sun, Moon, Cloud,
  Dog, Fish, Bird, Bike, Plane, Ship, Bus,
  Phone, Camera, Music, Globe, Map,
  Watch, Key, Wallet, CreditCard, HandCoins,
  Smile, Palette, type LucideIcon,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const iconMap: Record<string, LucideIcon> = {
  餐饮: UtensilsCrossed,
  零食: Cookie,
  水果: Apple,
  饮品: Coffee,
  烟酒: Wine,
  购物: ShoppingBag,
  服饰: Shirt,
  美妆: Sparkles,
  交通: Car,
  通讯: Smartphone,
  水电: Zap,
  还贷: Landmark,
  家居: Sofa,
  娱乐: Film,
  游戏: Gamepad2,
  运动: Trophy,
  健身: Dumbbell,
  社交: Beer,
  学习: BookOpen,
  数码: Monitor,
  医疗: HeartPulse,
  宠物: Cat,
  理发: Scissors,
  礼物: Gift,
  旅行: Backpack,
  维修: Wrench,
  快递: Package,
  母婴: Baby,
  保险: ShieldCheck,
  其他: MoreHorizontal,
  工资: Briefcase,
  奖金: Award,
  兼职: Laptop,
  理财: TrendingUp,
  投资: TrendingDown,
  租金: Building,
  红包: Gift,
  退款: Undo2,
  报销: Receipt,
  稿费: PenLine,
  礼金: Gem,
  补贴: Banknote,
  分红: ChartPie,
};

const pickableMap: Record<string, LucideIcon> = {
  Heart: HeartPulse, Star, Tag, Bell, Flag, Crown, Gem, Flame, Sparkles, Sun, Moon, Cloud,
  Cat, Dog, Fish, Bird, Car, Bike, Plane, Ship, Bus,
  Phone, Camera, Music, Book: BookOpen, Globe, Map,
  Coffee, Apple, Cookie, Beer, Gift, Shirt, Watch, Key,
  Wallet, CreditCard, HandCoins, Trophy, Shield: ShieldCheck,
  Smile, Palette, Pen: PenLine,
};

export const PICKABLE_ICONS = Object.keys(pickableMap);

interface Props {
  name: string;
  size?: number;
  className?: string;
  icon?: string;
}

export default function CategoryIcon({ name, size = 16, className, icon }: Props) {
  const getCategoryIcon = useStore(s => s.getCategoryIcon);
  const Icon = iconMap[name] || (icon && pickableMap[icon]);
  if (Icon) {
    return <Icon size={size} className={className} />;
  }
  const fallbackIconName = getCategoryIcon(name);
  const FallbackIcon = fallbackIconName !== '📦' ? pickableMap[fallbackIconName] : null;
  if (FallbackIcon) {
    return <FallbackIcon size={size} className={className} />;
  }
  return <span className={className} style={{ fontSize: size, lineHeight: 1 }}>📦</span>;
}
