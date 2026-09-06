import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Dumbbell,
  Droplet,
  Code,
  Brain,
  Moon,
  Sun,
  Heart,
  Footprints,
  Coffee,
  PenTool,
  Timer,
  Target,
  ShieldAlert,
  Sparkles,
  Zap,
  Activity,
  Circle,
  Apple,
  Pill,
  Bike,
  Headphones,
  Bed,
  Smile,
  Trophy,
  Award,
  Star,
  Medal,
  DollarSign,
  Wallet,
  Briefcase,
  Laptop,
  TrendingUp,
  Calendar,
  Clock,
  Leaf,
  Compass,
  Eye,
  Camera,
  Flag,
  Feather,
} from 'lucide-react-native';
import { COLORS, useThemeColors } from '../../constants/theme';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color,
}) => {
  const themeColors = useThemeColors();
  const activeColor = color || themeColors.textPrimary;

  switch (name) {
    case 'book-open':
      return <BookOpen size={size} color={activeColor} />;
    case 'check-circle-2':
      return <CheckCircle2 size={size} color={activeColor} />;
    case 'flame':
      return <Flame size={size} color={activeColor} />;
    case 'dumbbell':
      return <Dumbbell size={size} color={activeColor} />;
    case 'droplet':
      return <Droplet size={size} color={activeColor} />;
    case 'code':
      return <Code size={size} color={activeColor} />;
    case 'brain':
      return <Brain size={size} color={activeColor} />;
    case 'moon':
      return <Moon size={size} color={activeColor} />;
    case 'sun':
      return <Sun size={size} color={activeColor} />;
    case 'heart':
      return <Heart size={size} color={activeColor} />;
    case 'footprints':
      return <Footprints size={size} color={activeColor} />;
    case 'coffee':
      return <Coffee size={size} color={activeColor} />;
    case 'pen-tool':
      return <PenTool size={size} color={activeColor} />;
    case 'timer':
      return <Timer size={size} color={activeColor} />;
    case 'target':
      return <Target size={size} color={activeColor} />;
    case 'shield-alert':
      return <ShieldAlert size={size} color={activeColor} />;
    case 'sparkles':
      return <Sparkles size={size} color={activeColor} />;
    case 'zap':
      return <Zap size={size} color={activeColor} />;
    case 'activity':
      return <Activity size={size} color={activeColor} />;
    case 'apple':
      return <Apple size={size} color={activeColor} />;
    case 'pill':
      return <Pill size={size} color={activeColor} />;
    case 'bike':
      return <Bike size={size} color={activeColor} />;
    case 'headphones':
      return <Headphones size={size} color={activeColor} />;
    case 'bed':
      return <Bed size={size} color={activeColor} />;
    case 'smile':
      return <Smile size={size} color={activeColor} />;
    case 'trophy':
      return <Trophy size={size} color={activeColor} />;
    case 'award':
      return <Award size={size} color={activeColor} />;
    case 'star':
      return <Star size={size} color={activeColor} />;
    case 'medal':
      return <Medal size={size} color={activeColor} />;
    case 'dollar-sign':
      return <DollarSign size={size} color={activeColor} />;
    case 'wallet':
      return <Wallet size={size} color={activeColor} />;
    case 'briefcase':
      return <Briefcase size={size} color={activeColor} />;
    case 'laptop':
      return <Laptop size={size} color={activeColor} />;
    case 'trending-up':
      return <TrendingUp size={size} color={activeColor} />;
    case 'calendar':
      return <Calendar size={size} color={activeColor} />;
    case 'clock':
      return <Clock size={size} color={activeColor} />;
    case 'leaf':
      return <Leaf size={size} color={activeColor} />;
    case 'compass':
      return <Compass size={size} color={activeColor} />;
    case 'eye':
      return <Eye size={size} color={activeColor} />;
    case 'camera':
      return <Camera size={size} color={activeColor} />;
    case 'flag':
      return <Flag size={size} color={activeColor} />;
    case 'feather':
      return <Feather size={size} color={activeColor} />;
    default:
      return <Circle size={size} color={activeColor} />;
  }
};
