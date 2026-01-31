import type { Metadata } from 'next'
import { Inter, Cairo } from 'next/font/google'
import '@/app/globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})
const cairo = Cairo({
    subsets: ['arabic'],
    variable: '--font-cairo',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Dawii - Contribute Your Voice',
    description: 'Help build the next generation of speech recognition.',
}

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'ar' }]
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    const dir = lang === 'ar' ? 'rtl' : 'ltr'

    return (
        <html lang={lang} dir={dir}>
            <body className={cn(inter.variable, cairo.variable, "font-sans antialiased")}>
                {children}
            </body>
        </html>
    )
}
