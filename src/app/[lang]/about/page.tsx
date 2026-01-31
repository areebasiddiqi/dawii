'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mic, Heart, Users, Globe, ArrowLeft } from 'lucide-react'

export default function AboutPage() {
    const params = useParams()
    const lang = params.lang as string
    const isAr = lang === 'ar'

    const t = {
        back: isAr ? 'العودة للرئيسية' : 'Back to Home',
        title: isAr ? 'عن دوي' : 'About Dawii',
        subtitle: isAr
            ? 'نحن في مهمة لدمقرطة تكنولوجيا الصوت للجميع.'
            : 'We are on a mission to democratize voice technology for everyone.',
        mission: {
            title: isAr ? 'مهمتنا' : 'Our Mission',
            desc: isAr
                ? 'يهدف دوي إلى بناء أكبر مجموعة بيانات صوتية مفتوحة المصدر للغة العربية، تمكين المطورين والباحثين لبناء الجيل القادم من أدوات الذكاء الاصطناعي.'
                : 'Dawii aims to build the largest open-source voice dataset for the Arabic language, empowering developers and researchers to build the next generation of AI tools.'
        },
        values: {
            title: isAr ? 'قيمنا' : 'Our Values',
            v1: { title: isAr ? 'المجتمع أولاً' : 'Community First', desc: isAr ? 'نؤمن بقوة التعاون الجماعي.' : 'We believe in the power of collective collaboration.' },
            v2: { title: isAr ? 'الشفافية' : 'Transparency', desc: isAr ? 'كل ما نقوم به مفتوح وقابل للتحقق.' : 'Everything we do is open and verifiable.' },
            v3: { title: isAr ? 'الجودة' : 'Quality', desc: isAr ? 'نلتزم بأعلى معايير جودة البيانات.' : 'We are committed to the highest data quality standards.' },
        },
        team: {
            title: isAr ? 'انضم إلينا' : 'Join Us',
            desc: isAr ? 'كن جزءاً من الثورة الصوتية العربية.' : 'Be part of the Arabic voice revolution.',
            cta: isAr ? 'ابدأ المساهمة' : 'Start Contributing'
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto">
                <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-12 transition-colors">
                    <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    {t.back}
                </Link>

                <header className="mb-20 text-center">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
                        <Mic className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {t.title}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t.subtitle}
                    </p>
                </header>

                <div className="space-y-24">
                    {/* Mission Section */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-indigo-400" />
                                    {t.mission.title}
                                </h2>
                                <p className="text-gray-300 leading-relaxed text-lg">
                                    {t.mission.desc}
                                </p>
                            </div>
                            <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-20 animate-pulse" />
                        </div>
                    </section>

                    {/* Values Grid */}
                    <section>
                        <h2 className="text-3xl font-bold mb-12 text-center">{t.values.title}</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <ValueCard icon={<Users className="text-blue-400" />} title={t.values.v1.title} desc={t.values.v1.desc} />
                            <ValueCard icon={<Globe className="text-green-400" />} title={t.values.v2.title} desc={t.values.v2.desc} />
                            <ValueCard icon={<Heart className="text-red-400" />} title={t.values.v3.title} desc={t.values.v3.desc} />
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center py-12">
                        <h2 className="text-3xl font-bold mb-4">{t.team.title}</h2>
                        <p className="text-gray-400 mb-8">{t.team.desc}</p>
                        <Link
                            href={`/${lang}/signup`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-600/25"
                        >
                            {t.team.cta}
                            <Mic className="w-5 h-5" />
                        </Link>
                    </section>
                </div>

                <footer className="mt-24 pt-12 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>© 2026 Dawii Platform</p>
                </footer>
            </div>
        </div>
    )
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}
