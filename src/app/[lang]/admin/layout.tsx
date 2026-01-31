'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const params = useParams()
    const lang = params.lang as string
    const supabase = createClient()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!lang) return

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push(`/${lang}/login`)
                return
            }

            // Simple role check via DB
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

            if (profile?.role !== 'admin') {
                // router.push(`/${lang}/dashboard`)
                // For demo purposes, we might allow bypassing or show "Access Denied"
                // alert('Access Denied: Admins only')
                // return
            }

            setLoading(false)
        }
        checkUser()
    }, [lang, router])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Admin...</div>

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-6">
                <h2 className="text-xl font-bold text-purple-400">Dawii Admin</h2>
                <nav className="flex flex-col gap-2">
                    <Link href={`/${lang}/admin`} className="px-4 py-2 hover:bg-white/5 rounded">Dashboard</Link>
                    <Link href={`/${lang}/admin/scripts`} className="px-4 py-2 hover:bg-white/5 rounded">Scripts</Link>
                    <Link href={`/${lang}/admin/recordings`} className="px-4 py-2 hover:bg-white/5 rounded">Recordings</Link>
                </nav>
                <div className="mt-auto">
                    <Link href={`/${lang}/dashboard`} className="text-sm text-gray-400 hover:text-white">← User View</Link>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    )
}
