import {
    Home,
    Wallet,
    Utensils,
    Car,
    Briefcase,
    BookOpen,
    GraduationCap,
    Heart,
    Gift,
    ShoppingCart,
    Star
} from 'lucide-react';
import {createElement} from 'react';

// Маппинг строковых ключей на Lucide-иконки
const iconMap: Record<string, any> = {
    // Жильё
    home: Home,
    rent: Home,
    utilities: Home,
    mortgage: Home,

    // Доходы
    salary: Wallet,
    income: Wallet,
    freelance: Briefcase,
    gift: Gift,
    investment: Star,

    // Транспорт
    car: Car,
    transport: Car,
    fuel: Car,

    // Еда
    food: Utensils,
    grocery: ShoppingCart,

    // Образование
    education: BookOpen,
    course: GraduationCap,
    study: GraduationCap,

    // Развлечения
    entertainment: Heart,
    hobby: Star,
    cinema: Star,

    // По умолчанию
    default: Wallet,
};

type ScheduleIconProps = {
    icon?: string | null;
    className?: string;
};

/**
 * Умный компонент иконки: поддерживает
 * - emoji (🏠, 💰)
 * - URL (/icons/custom.svg)
 * - ключи из iconMap → Lucide
 */
export function ScheduleIcon({icon, className = 'w-6 h-6'}: ScheduleIconProps) {
    if (!icon) {
        return <Wallet className={className}/>;
    }

    // 1. Если это URL (начинается с / или http)
    if (icon.startsWith('/') || icon.startsWith('http')) {
        return (
            <img
                src={icon}
                alt=""
                className={className}
                loading="lazy"
            />
        );
    }

    // 2. Если это emoji (простая проверка: короткая строка с символами вне ASCII)
    if (/^[\p{Emoji}\p{So}]/u.test(icon.trim()) && icon.length <= 5) {
        return <span className={className}>{icon}</span>;
    }

    // 3. Ищем в маппинге Lucide
    const LucideComponent = iconMap[icon.toLowerCase()] || iconMap.default;

    return createElement(LucideComponent, {className});
}
