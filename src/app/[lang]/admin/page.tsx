import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const supabase = await createClient()

    // Fetch stats in parallel
    const [
        { count: usersCount },
        { count: recordingsCount },
        { count: scriptsCount },
        { data: profiles },
        { data: recordings }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('recordings').select('*', { count: 'exact', head: true }),
        supabase.from('scripts').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*').order('points', { ascending: false }),
        supabase.from('recordings').select('*')
    ])

    // Calculate aggregate stats
    const totalRecordings = recordingsCount || 0
    const totalScripts = scriptsCount || 0
    const totalUsers = usersCount || 0

    // Calculate total points awarded
    const totalPoints = profiles?.reduce((sum, p) => sum + (p.points || 0), 0) || 0

    // Calculate average recordings per user
    const avgRecordingsPerUser = totalUsers > 0 ? (totalRecordings / totalUsers).toFixed(1) : 0

    // Get top performers (top 5)
    const topPerformers = profiles?.slice(0, 5) || []

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>

            {/* Aggregate Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30">
                    <h3 className="text-purple-300 text-sm mb-1">Total Users</h3>
                    <p className="text-4xl font-bold text-purple-400">{totalUsers}</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 border border-indigo-500/30">
                    <h3 className="text-indigo-300 text-sm mb-1">Total Recordings</h3>
                    <p className="text-4xl font-bold text-indigo-400">{totalRecordings}</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30">
                    <h3 className="text-green-300 text-sm mb-1">Total Scripts</h3>
                    <p className="text-4xl font-bold text-green-400">{totalScripts}</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/30">
                    <h3 className="text-pink-300 text-sm mb-1">Total Points</h3>
                    <p className="text-4xl font-bold text-pink-400">{totalPoints}</p>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📊</span>
                        System Statistics
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Recordings/User:</span>
                            <span className="text-xl font-bold text-indigo-400">{avgRecordingsPerUser}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Points/User:</span>
                            <span className="text-xl font-bold text-purple-400">
                                {totalUsers > 0 ? (totalPoints / totalUsers).toFixed(1) : 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>🏆</span>
                        Top Performers
                    </h3>
                    <div className="space-y-2">
                        {topPerformers.map((profile, index) => (
                            <div key={profile.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                                    </span>
                                    <span className="font-medium text-white">{profile.full_name || 'Unknown'}</span>
                                </div>
                                <span className="text-indigo-400 font-bold">{profile.points || 0} pts</span>
                            </div>
                        ))}
                        {topPerformers.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-4">No users yet</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Users & Bank Details</h2>
                <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                    <table className="w-full text-left font-mono text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 bg-black/20">
                                <th className="p-4">Full Name</th>
                                <th className="p-4">Points</th>
                                <th className="p-4">Dialect</th>
                                <th className="p-4">Bank Name</th>
                                <th className="p-4">IBAN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {profiles?.map((profile: any) => (
                                <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{profile.full_name || 'N/A'}</td>
                                    <td className="p-4 text-indigo-400 font-bold">{profile.points || 0}</td>
                                    <td className="p-4">
                                        {profile.dialect ? (
                                            <span className="px-2 py-1 rounded text-xs uppercase bg-white/10 text-gray-300 border border-white/5">
                                                {profile.dialect}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-300">{profile.bank_name || <span className="text-gray-600 italic">Not set</span>}</td>
                                    <td className="p-4 font-mono text-gray-400">{profile.iban || <span className="text-gray-600 italic">Not set</span>}</td>
                                </tr>
                            ))}
                            {(!profiles || profiles.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
