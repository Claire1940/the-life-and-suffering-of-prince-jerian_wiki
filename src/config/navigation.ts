import type { LucideIcon } from 'lucide-react'
import {
	BookOpen,
	CalendarClock,
	Film,
	Map,
	SlidersHorizontal,
	Trophy,
	Users,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'guide' -> t('nav.guide')
	path: string // URL 路径，如 '/guide'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航分类（与 content/<locale>/ 目录名严格一致；community 分类已按要求移除，不进导航栏）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'walkthrough', path: '/walkthrough', icon: Map, isContentType: true },
	{ key: 'endings', path: '/endings', icon: Trophy, isContentType: true },
	{ key: 'characters', path: '/characters', icon: Users, isContentType: true },
	{ key: 'builds', path: '/builds', icon: SlidersHorizontal, isContentType: true },
	{ key: 'release', path: '/release', icon: CalendarClock, isContentType: true },
	{ key: 'media', path: '/media', icon: Film, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['guide', 'walkthrough', 'endings', 'characters', 'builds', 'release', 'media']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
