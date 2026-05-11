'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mic, Award, Shield, Languages, ArrowRight, ChevronDown, Menu } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import LanguageToggle from '@/components/language-toggle'

function DawiiLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm" style={{ transform: 'scale(1.15)' }} />
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-full h-full text-white">
                    <path d="M12 3V21M8 8V16M16 8V16M4 11V13M20 11V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <span className="text-xl font-bold font-outfit tracking-tight">Dawii</span>
        </div>
    )
}

export default function LandingPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string
    const isAr = lang === 'ar'
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    const t = {
        badge: isAr ? 'انضم إلى أكثر من 10,000 مساهم' : 'Join 10,000+ Contributors',
        titleA: isAr ? 'شارك بصوتك،' : 'Contribute Your Voice,',
        titleB: isAr ? 'اصنع المستقبل' : 'Shape the Future',
        subtitle: isAr
            ? 'ساهم في بناء الجيل القادم من تقنيات التعرف على الكلام للغتين العربية والإنجليزية.'
            : 'Help build the next generation of speech recognition technology for Arabic and English languages.',
        start: isAr ? 'ابدأ التسجيل' : 'Start Recording',
        more: isAr ? 'اعرف المزيد' : 'Learn More',
        login: isAr ? 'تسجيل الدخول' : 'Login',
        signup: isAr ? 'إنشاء حساب' : 'Sign Up',
        dashboard: isAr ? 'لوحة التحكم' : 'Dashboard',
        about: isAr ? 'عن المنصة' : 'About Us',
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
            desc: isAr ? 'سير عملنا المبسط يضمن لك التركيز على ما يهم - صوتك. لا إعدادات معقدة أو معرفة تقنية مطلوبة.' : "Our streamlined workflow ensures you can focus on what matters most - your voice. No complicated setups or technical knowledge required.",
            cta: isAr ? 'ابدأ الآن' : 'Get Started Now',
            step1: { title: isAr ? 'اختر النص' : 'Select Script', desc: isAr ? 'تصفح مكتبتنا المختارة واختر ما تريد قراءته.' : 'Browse our curated library of texts and choose what to read.' },
            step2: { title: isAr ? 'سجل الصوت' : 'Record Audio', desc: isAr ? 'استخدم مسجل الاستوديو الخاص بنا لالتقاط صوتك.' : 'Use our studio-grade recorder to capture your voice.' },
            step3: { title: isAr ? 'إرسال' : 'Submit', desc: isAr ? 'راجع تسجيلك وأرسله للتحقق من الجودة.' : 'Review your recording and send it for quality check.' },
            step4: { title: isAr ? 'اكسب النقاط' : 'Earn Points', desc: isAr ? 'احصل على المكافآت وارتق في قائمة المتصدرين.' : 'Get rewarded and climb the contributor leaderboard.' },
        },
        faq: {
            title: isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions',
            items: [
                {
                    q: isAr ? 'ما هي المعدات التي أحتاجها؟' : 'What equipment do I need?',
                    a: isAr ? 'كل ما تحتاجه هو جهاز كمبيوتر أو هاتف ذكي ومكان هادئ. لا يلزم ميكروفون احترافي.' : 'All you need is a computer or smartphone and a quiet place. No professional microphone is required.',
                },
                {
                    q: isAr ? 'كيف يتم احتساب النقاط؟' : 'How are points calculated?',
                    a: isAr ? 'تعتمد النقاط على طول النص وصعوبته. النصوص الأطول والأصعب تمنح نقاطاً أكثر.' : 'Points are based on script length and difficulty. Longer and harder scripts award more points.',
                },
                {
                    q: isAr ? 'هل يمكنني التسجيل في بيئة صاخبة؟' : 'Can I record in a noisy environment?',
                    a: isAr ? 'يُفضّل التسجيل في مكان هادئ للحصول على أفضل جودة، لكن أدواتنا تساعد في تقليل الضوضاء.' : "We recommend recording in a quiet space for the best quality, though our tools help reduce background noise.",
                },
                {
                    q: isAr ? 'هل بياناتي الصوتية خاصة؟' : 'Is my voice data private?',
                    a: isAr ? 'نعم، يتم إخفاء هوية جميع البيانات واستخدامها فقط لأغراض البحث وتدريب النماذج.' : 'Yes, all data is anonymized and used strictly for research and model training purposes.',
                },
                {
                    q: isAr ? 'كيف أصبح مراجعاً؟' : 'How do I become a reviewer?',
                    a: isAr ? 'بعد جمع نقاط كافية وتحقيق سجل عالي الجودة، يمكنك التقديم لأن تصبح مراجعاً من لوحة التحكم.' : 'After accumulating enough points and maintaining a high-quality record, you can apply to become a reviewer from your dashboard.',
                },
            ],
        },
        footer: {
            tagline: isAr ? 'تمكين تقنية الصوت من خلال مساهمة المجتمع. انضم إلينا في صياغة مستقبل الذكاء الاصطناعي.' : 'Empowering voice technology through community contribution. Join us in shaping the future of AI.',
            platform: isAr ? 'المنصة' : 'Platform',
            support: isAr ? 'الدعم' : 'Support',
            stay: isAr ? 'ابقَ على اطلاع' : 'Stay Updated',
            emailPh: isAr ? 'أدخل البريد الإلكتروني' : 'Enter email address',
            about: isAr ? 'عن المنصة' : 'About Us',
            how: isAr ? 'كيف يعمل' : 'How it Works',
            rewards: isAr ? 'المكافآت' : 'Rewards',
            faq: isAr ? 'الأسئلة الشائعة' : 'FAQ',
            contact: isAr ? 'اتصل بنا' : 'Contact',
            privacy: isAr ? 'سياسة الخصوصية' : 'Privacy Policy',
            rights: isAr ? '© 2026 منصة دَوِي. جميع الحقوق محفوظة.' : '© 2026 Dawii Platform. All rights reserved.',
        },
    }

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsAuthenticated(!!user)
            setLoading(false)
        }
        checkAuth()
    }, [lang])

    const handleStartClick = () => {
        if (isAuthenticated) {
            router.push(`/${lang}/dashboard`)
        } else {
            router.push(`/${lang}/signup`)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-header">
                <nav className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/${lang}`} className="flex items-center gap-2 group">
                            <DawiiLogo />
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href={`/${lang}/about`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                {t.about}
                            </Link>
                            <div className="w-px h-6 bg-white/10 mx-2" />
                            <LanguageToggle />
                            <div className="flex items-center gap-3">
                                {!loading && !isAuthenticated && (
                                    <>
                                        <Link href={`/${lang}/login`}>
                                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 text-white hover:bg-white/10 transition-colors">
                                                {t.login}
                                            </button>
                                        </Link>
                                        <Link href={`/${lang}/signup`}>
                                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-colors">
                                                {t.signup}
                                            </button>
                                        </Link>
                                    </>
                                )}
                                {!loading && isAuthenticated && (
                                    <Link href={`/${lang}/dashboard`}>
                                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 transition-colors">
                                            {t.dashboard}
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {mobileOpen && (
                        <div className="md:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-4">
                            <Link href={`/${lang}/about`} className="text-sm text-gray-300 hover:text-white">{t.about}</Link>
                            <LanguageToggle />
                            {!loading && !isAuthenticated && (
                                <>
                                    <Link href={`/${lang}/login`} className="text-sm text-white hover:text-purple-300">{t.login}</Link>
                                    <Link href={`/${lang}/signup`} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white">{t.signup}</Link>
                                </>
                            )}
                            {!loading && isAuthenticated && (
                                <Link href={`/${lang}/dashboard`} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white">{t.dashboard}</Link>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1553358814-833ee10c95a0?q=80&w=2070&auto=format&fit=crop"
                        alt="Sound waves background"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-slate-950/80 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />
                </div>

                <div className="container relative z-10 px-4 mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 flex justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-purple-200">{t.badge}</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 font-outfit leading-tight">
                            {t.titleA}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{t.titleB}</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <button
                                onClick={handleStartClick}
                                className="inline-flex items-center justify-center font-medium h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/50 rounded-xl w-full sm:w-auto transition-colors"
                            >
                                {t.start}
                                <Mic className="h-5 w-5 ms-2" />
                            </button>
                            <a href="#features" className="inline-flex items-center justify-center font-medium h-14 px-8 text-lg border border-white/20 hover:bg-white/10 text-white rounded-xl w-full sm:w-auto transition-colors">
                                {t.more}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500">
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-2">
                        <div className="w-1 h-2 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 bg-slate-950 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-outfit">{t.features.title}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{t.features.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard icon={<Mic className="h-6 w-6 text-purple-400" />} title={t.features.f1.title} desc={t.features.f1.desc} />
                        <FeatureCard icon={<Award className="h-6 w-6 text-purple-400" />} title={t.features.f2.title} desc={t.features.f2.desc} />
                        <FeatureCard icon={<Shield className="h-6 w-6 text-purple-400" />} title={t.features.f3.title} desc={t.features.f3.desc} />
                        <FeatureCard icon={<Languages className="h-6 w-6 text-purple-400" />} title={t.features.f4.title} desc={t.features.f4.desc} />
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-24 bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-start">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-outfit">
                                {t.process.title1}<br />
                                <span className="text-purple-400">{t.process.title2}</span>
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">{t.process.desc}</p>
                            <button
                                onClick={handleStartClick}
                                className="inline-flex items-center justify-center font-medium underline-offset-4 hover:underline h-10 text-purple-400 text-lg hover:text-purple-300 transition-colors"
                            >
                                {t.process.cta}
                                <ArrowRight className="h-5 w-5 ms-2 rtl:rotate-180" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ProcessCard number="01" title={t.process.step1.title} desc={t.process.step1.desc} />
                            <ProcessCard number="02" title={t.process.step2.title} desc={t.process.step2.desc} />
                            <ProcessCard number="03" title={t.process.step3.title} desc={t.process.step3.desc} />
                            <ProcessCard number="04" title={t.process.step4.title} desc={t.process.step4.desc} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-outfit">{t.faq.title}</h2>
                    <div className="glass-card p-8 rounded-2xl">
                        {t.faq.items.map((item, idx) => (
                            <FAQItem
                                key={idx}
                                question={item.q}
                                answer={item.a}
                                isOpen={expandedFaq === idx}
                                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 pt-20 pb-10 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-start">
                        <div className="col-span-1 md:col-span-1">
                            <div className="mb-6">
                                <DawiiLogo />
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{t.footer.tagline}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">{t.footer.platform}</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><Link href={`/${lang}/about`} className="hover:text-purple-400 transition-colors">{t.footer.about}</Link></li>
                                <li><a href="#features" className="hover:text-purple-400 transition-colors">{t.footer.how}</a></li>
                                <li><a href="#features" className="hover:text-purple-400 transition-colors">{t.footer.rewards}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">{t.footer.support}</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.faq}</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.contact}</a></li>
                                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.privacy}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">{t.footer.stay}</h4>
                            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={t.footer.emailPh}
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-purple-500 text-start"
                                />
                                <button
                                    type="submit"
                                    aria-label="Subscribe"
                                    className="inline-flex items-center justify-center rounded-md h-10 w-10 bg-purple-600 hover:bg-purple-700 shrink-0 transition-colors"
                                >
                                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">{t.footer.rights}</p>
                        <div className="flex gap-6 text-gray-500">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-colors group text-start">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 font-outfit">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}

function ProcessCard({ number, title, desc }: { number: string; title: string; desc: string }) {
    return (
        <div className="bg-slate-800/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden text-start">
            <div className="absolute -right-4 -top-4 text-6xl font-bold text-white/5 font-outfit">{number}</div>
            <h3 className="text-xl font-bold mb-2 relative z-10">{title}</h3>
            <p className="text-gray-400 text-sm relative z-10">{desc}</p>
        </div>
    )
}

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-4 flex items-center justify-between text-start hover:text-purple-400 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="font-medium text-lg text-start">{question}</span>
                <ChevronDown className={`h-5 w-5 transition-transform shrink-0 ms-4 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-400 leading-relaxed text-start">
                    {answer}
                </div>
            )}
        </div>
    )
}
