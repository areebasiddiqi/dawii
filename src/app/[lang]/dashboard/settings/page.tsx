'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string
    const isAr = lang === 'ar'

    const t = {
        title: isAr ? 'إعدادات الملف الشخصي' : 'Profile Settings',
        fullName: isAr ? 'الاسم الكامل' : 'Full Name',
        dialect: isAr ? 'اللهجة' : 'Dialect',
        iban: isAr ? 'رقم الآيبان' : 'IBAN',
        bankName: isAr ? 'اسم البنك' : 'Bank Name',
        save: isAr ? 'حفظ' : 'Save Changes',
        back: isAr ? 'رجوع' : 'Back to Dashboard',
        selectDialect: isAr ? 'اختر اللهجة' : 'Select Dialect',
        selectBank: isAr ? 'اختر البنك' : 'Select Bank',
        saving: isAr ? 'جاري الحفظ...' : 'Saving...',
        success: isAr ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!',
        error: isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes',
    }

    const dialects = [
        { value: 'hijazi', label: isAr ? 'حجازي' : 'Hijazi' },
        { value: 'najdi', label: isAr ? 'نجدي' : 'Najdi' },
        { value: 'shimali', label: isAr ? 'شمالي' : 'Shimali' },
        { value: 'sharqawi', label: isAr ? 'شرقاوي' : 'Sharqawi' },
        { value: 'janoubi', label: isAr ? 'جنوبي' : 'Janoubi' },
    ]

    const banks = [
        'Saudi National Bank (SNB)',
        'Al Rajhi Bank',
        'Riyad Bank',
        'Saudi Awwal Bank (SAB)',
        'Banque Saudi Fransi (BSF)',
        'Arab National Bank (ANB)',
        'Alinma Bank',
        'Bank AlBilad',
        'Bank AlJazira',
        'Saudi Investment Bank (SAIB)',
        'Gulf International Bank - Saudi Arabia (GIB-SA)',
    ]

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form fields
    const [fullName, setFullName] = useState('')
    const [dialect, setDialect] = useState('')
    const [iban, setIban] = useState('')
    const [bankName, setBankName] = useState('')

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push(`/${lang}/login`)
                return
            }

            setUser(user)

            // Load profile data
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setFullName(profileData.full_name || '')
                setDialect(profileData.dialect || '')
                setIban(profileData.iban || '')
                setBankName(profileData.bank_name || '')
            }

            setLoading(false)
        }

        loadProfile()
    }, [lang, router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const supabase = createClient()

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                dialect: dialect || null,
                iban: iban || null,
                bank_name: bankName || null,
            })
            .eq('id', user.id)

        if (error) {
            alert(t.error + ': ' + error.message)
        } else {
            alert(t.success)
        }

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-white text-lg">Loading...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => router.push(`/${lang}/dashboard`)}
                    className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                    {t.title}
                </h1>
            </div>

            <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.fullName}
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        required
                    />
                </div>

                {/* Dialect */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.dialect}
                    </label>
                    <select
                        value={dialect}
                        onChange={(e) => setDialect(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    >
                        <option value="">{t.selectDialect}</option>
                        {dialects.map((d) => (
                            <option key={d.value} value={d.value}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* IBAN */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.iban}
                    </label>
                    <input
                        type="text"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="SA00 0000 0000 0000 0000 0000"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {isAr ? 'أدخل رقم الآيبان الخاص بك' : 'Enter your IBAN number'}
                    </p>
                </div>

                {/* Bank Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.bankName}
                    </label>
                    <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    >
                        <option value="">{t.selectBank}</option>
                        {banks.map((bank) => (
                            <option key={bank} value={bank}>
                                {bank}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {saving ? t.saving : t.save}
                </button>
            </form>
        </div>
    )
}
