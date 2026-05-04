'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LanguageToggle from '@/components/language-toggle'

export default function ResetPassword() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string
    const supabase = createClient()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' })
            return
        }

        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
            setLoading(false)
        } else {
            setMessage({ type: 'success', text: lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully' })
            setTimeout(() => {
                router.push(`/${lang}/dashboard`)
            }, 2000)
        }
    }

    const isAr = lang === 'ar'
    const t = {
        title: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password',
        password: isAr ? 'كلمة المرور الجديدة' : 'New Password',
        confirmPassword: isAr ? 'تأكيد كلمة المرور' : 'Confirm Password',
        submit: isAr ? 'تحديث كلمة المرور' : 'Update Password',
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-8">
            <div className="absolute top-6 right-6">
                <LanguageToggle />
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    {t.title}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleUpdatePassword}>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-200">
                            {t.password}
                        </label>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-200">
                            {t.confirmPassword}
                        </label>
                        <div className="mt-2">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-2"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            <p className="text-sm">{message.text}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        >
                            {loading ? '...' : t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
