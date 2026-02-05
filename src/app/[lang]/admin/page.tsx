import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const supabase = await createClient()

    // Fetch stats in parallel
    const [
        { count: usersCount },
        { count: recordingsCount },
        { count: pendingCount }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('recordings').select('*', { count: 'exact', head: true }),
        supabase.from('recordings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gray-900 border border-white/10">
                    <h3 className="text-gray-400">Total Users</h3>
                    <p className="text-4xl font-bold">{usersCount || 0}</p>
                </div>
                <div className="p-6 rounded-xl bg-gray-900 border border-white/10">
                    <h3 className="text-gray-400">Total Recordings</h3>
                    <p className="text-4xl font-bold text-indigo-400">{recordingsCount || 0}</p>
                </div>

            </div>
        </div>
    )
}
