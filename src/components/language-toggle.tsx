'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export default function LanguageToggle({ className = '' }: { className?: string }) {
    const params = useParams()
    const pathname = usePathname() || '/'
    const lang = (params?.lang as string) || 'en'
    const isAr = lang === 'ar'
    const targetLang = isAr ? 'en' : 'ar'

    const segments = pathname.split('/')
    if (segments[1] === 'en' || segments[1] === 'ar') {
        segments[1] = targetLang
    } else {
        segments.splice(1, 0, targetLang)
    }
    const href = segments.join('/') || `/${targetLang}`

    return (
        <Link
            href={href}
            role="switch"
            aria-checked={isAr}
            aria-label="Toggle language"
            className={`relative inline-flex items-center h-8 w-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors ${className}`}
        >
            <span
                className={`absolute top-0.5 h-7 w-7 rounded-full bg-indigo-600 shadow transition-transform duration-200 ${isAr ? 'translate-x-8' : 'translate-x-0.5'}`}
            />
            <span className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors ${!isAr ? 'text-white' : 'text-gray-400'}`}>EN</span>
            <span className={`relative z-10 flex-1 text-center text-xs font-semibold transition-colors ${isAr ? 'text-white' : 'text-gray-400'}`}>ع</span>
        </Link>
    )
}
