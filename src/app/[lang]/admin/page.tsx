import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const supabase = await createClient()

    // Fetch stats in parallel
    const [
        { count: usersCount },
        { count: recordingsCount },
        { count: pendingCount },
        { data: profiles }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('recordings').select('*', { count: 'exact', head: true }),
        supabase.from('recordings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*').order('full_name', { ascending: true })
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
        </div>
    )
}
