'use client'

import Link from 'next/link'
import { Mic, Zap, Shield, Globe, ArrowRight, Play, CheckCircle2, Star, User } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LandingPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string
    const isAr = lang === 'ar'
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    // Translations
    const t = {
        badge: isAr ? 'انضم إلى أكثر من 10,000 مساهم' : 'Join 10,000+ Contributors',
        title: isAr ? 'شارك بصوتك، اصنع المستقبل' : 'Contribute Your Voice, Shape the Future',
        subtitle: isAr
            ? 'ساهم في بناء الجيل القادم من تقنيات التعرف على الكلام للغتين العربية والإنجليزية.'
            : 'Help build the next generation of speech recognition technology for Arabic and English languages.',
        start: isAr ? 'ابدأ التسجيل' : 'Start Recording',
        more: isAr ? 'اعرف المزيد' : 'Learn More',
        login: isAr ? 'تسجيل الدخول' : 'Login',
        features: {
            title: isAr ? 'لماذا تساهم؟' : 'Why Contribute?',
            subtitle: isAr ? 'نقدم أفضل منصة للمساهمين الصوتيين مع أدوات ومكافآت مميزة.' : 'We provide the best platform for voice contributors with premium tools and rewards.',
            f1: { title: isAr ? 'جودة عالية' : 'High Fidelity', desc: isAr ? 'تسجيل صوتي فائق الوضوح مع معالجة الضوضاء.' : 'Crystal clear audio recording with noise reduction processing.' },
            f2: { title: isAr ? 'مكافآت فورية' : 'Instant Rewards', desc: isAr ? 'اكسب النقاط فوراً بعد الموافقة على تسجيلاتك.' : 'Earn points immediately after your submissions are approved.' },
            f3: { title: isAr ? 'خصوصية البيانات' : 'Data Privacy', desc: isAr ? 'بياناتك الصوتية مشفرة ومجهولة الهوية بأمان.' : 'Your voice data is encrypted and anonymized securely.' },
            f4: { title: isAr ? 'ثنائي اللغة' : 'Bilingual', desc: isAr ? 'دعم أصلي للمساهمين باللغتين العربية والإنجليزية.' : 'Native support for both Arabic and English contributors.' },
        },
        process: {
            title1: isAr ? 'عملية بسيطة،' : 'Simple process,',
            title2: isAr ? 'تأثير هادف.' : 'Meaningful impact.',
            desc: isAr ? 'سير عملنا المبسط يضمن لك التركيز على ما يهم - صوتك. لا إعدادات معقدة.' : 'Our streamlined workflow ensures you can focus on what matters most - your voice. No complicated setups or technical knowledge required.',
            step1: { title: isAr ? 'اختر النص' : 'Select Script', desc: isAr ? 'تصفح مكتبتنا المختارة واختر ما تريد قراءته.' : 'Browse our curated library of texts and choose what to read.' },
            step2: { title: isAr ? 'سجل الصوت' : 'Record Audio', desc: isAr ? 'استخدم مسجل الاستوديو الخاص بنا لالتقاط صوتك.' : 'Use our studio-grade recorder to capture your voice.' },
            step3: { title: isAr ? 'إرسال' : 'Submit', desc: isAr ? 'راجع تسجيلك وأرسله للتحقق من الجودة.' : 'Review your recording and send it for quality check.' },
            step4: { title: isAr ? 'اكسب النقاط' : 'Earn Points', desc: isAr ? 'احصل على المكافآت وارتق في قائمة المتصدرين.' : 'Get rewarded and climb the contributor leaderboard.' },
        },
        faq: {
            title: isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions',
            q1: isAr ? 'ما هي المعدات التي أحتاجها؟' : 'What equipment do I need?',
            a1: isAr ? 'كل ما تحتاجه هو جهاز كمبيوتر أو هاتف ذكي ومكان هادئ. لا يلزم ميكروفون احترافي.' : 'All you need is a computer or smartphone and a quiet place. No professional microphone is required.',
            q2: isAr ? 'كيف يتم احتساب النقاط؟' : 'How are points calculated?',
            a2: isAr ? 'تعتمد النقاط على طول النص وصعوبته. النصوص الأطول والأصعب تمنح نقاطاً أكثر.' : 'Points are based on script length and difficulty. Longer and harder scripts award more points.',
            q3: isAr ? 'هل بياناتي الصوتية خاصة؟' : 'Is my voice data private?',
            a3: isAr ? 'نعم، يتم إخفاء هوية جميع البيانات واستخدامها فقط لأغراض البحث وتدريب النماذج.' : 'Yes, all data is anonymized and used strictly for research and model training purposes.',
        },
        footer: {
            about: isAr ? 'عن المنصة' : 'About Us',
            contact: isAr ? 'اتصل بنا' : 'Contact',
            privacy: isAr ? 'سياسة الخصوصية' : 'Privacy Policy',
            rights: isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.',
        }
    }

    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsAuthenticated(!!user)
            setLoading(false)
        }
        checkAuth()
    }, [lang, router])

    const handleStartClick = () => {
        if (isAuthenticated) {
            router.push(`/${lang}/dashboard`)
        } else {
            router.push(`/${lang}/signup`)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        Dawii
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                        <Link href={`/${lang}/about`} className="hover:text-white transition-colors">{t.footer.about}</Link>

                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href={isAr ? '/en' : '/ar'} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <Globe className="w-5 h-5" />
                        </Link>
                        {!loading && !isAuthenticated && (
                            <Link href={`/${lang}/login`} className="text-sm font-medium hover:text-indigo-400 transition-colors">
                                {t.login}
                            </Link>
                        )}
                        {!loading && isAuthenticated && (
                            <Link href={`/${lang}/dashboard`} className="text-sm font-medium px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        {t.badge}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        {t.title}
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleStartClick}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 group"
                        >
                            <Mic className="w-5 h-5 group-hover:animate-pulse" />
                            {t.start}
                        </button>
                        <Link
                            href={`/${lang}/about`}
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            {t.more}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t.features.title}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{t.features.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard icon={<Mic className="text-indigo-400" />} title={t.features.f1.title} desc={t.features.f1.desc} />
                        <FeatureCard icon={<Zap className="text-yellow-400" />} title={t.features.f2.title} desc={t.features.f2.desc} />
                        <FeatureCard icon={<Shield className="text-green-400" />} title={t.features.f3.title} desc={t.features.f3.desc} />
                        <FeatureCard icon={<Globe className="text-blue-400" />} title={t.features.f4.title} desc={t.features.f4.desc} />
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            <span className="block text-white">{t.process.title1}</span>
                            <span className="block text-indigo-400">{t.process.title2}</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                            {t.process.desc}
                        </p>
                        <button onClick={handleStartClick} className="text-indigo-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                            {t.start} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid gap-6">
                        <ProcessCard number="01" title={t.process.step1.title} desc={t.process.step1.desc} />
                        <ProcessCard number="02" title={t.process.step2.title} desc={t.process.step2.desc} />
                        <ProcessCard number="03" title={t.process.step3.title} desc={t.process.step3.desc} />
                        <ProcessCard number="04" title={t.process.step4.title} desc={t.process.step4.desc} />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 text-center text-white/50">{t.faq.title}</h2>
                    <div className="space-y-4">
                        <FAQItem
                            question={t.faq.q1}
                            answer={t.faq.a1}
                            isOpen={expandedFaq === 0}
                            onClick={() => setExpandedFaq(expandedFaq === 0 ? null : 0)}
                        />
                        <FAQItem
                            question={t.faq.q2}
                            answer={t.faq.a2}
                            isOpen={expandedFaq === 1}
                            onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
                        />
                        <FAQItem
                            question={t.faq.q3}
                            answer={t.faq.a3}
                            isOpen={expandedFaq === 2}
                            onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#020617]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-400">
                        <div className="w-6 h-6 rounded bg-indigo-900 flex items-center justify-center">
                            <Mic className="w-3 h-3 text-indigo-400" />
                        </div>
                        Dawii
                    </div>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="#" className="hover:text-white transition-colors">{t.footer.about}</Link>
                        <Link href="#" className="hover:text-white transition-colors">{t.footer.privacy}</Link>

                    </div>

                    <p className="text-xs text-gray-600">© 2026 Dawii Platform. {t.footer.rights}</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}

function ProcessCard({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
            <span className="text-4xl font-bold text-white/10 group-hover:text-indigo-500/20 transition-colors font-mono">{number}</span>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
            </div>
        </div>
    )
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${isOpen ? 'bg-white/10 border-indigo-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
        >
            <div className="flex justify-between items-center">
                <span className="font-medium text-lg">{question}</span>
                <span className={`text-gray-500 text-2xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </div>
            {isOpen && (
                <div className="mt-4 text-gray-400 leading-relaxed animate-in fade-in slide-in-from-top-2 border-t border-white/5 pt-4">
                    {answer}
                </div>
            )}
        </div>
    )
}
