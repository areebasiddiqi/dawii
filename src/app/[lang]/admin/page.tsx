export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    // Static stats for now
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gray-900 border border-white/10">
                    <h3 className="text-gray-400">Total Users</h3>
                    <p className="text-4xl font-bold">1,234</p>
                </div>
                <div className="p-6 rounded-xl bg-gray-900 border border-white/10">
                    <h3 className="text-gray-400">Total Recordings</h3>
                    <p className="text-4xl font-bold text-indigo-400">8,502</p>
                </div>
                <div className="p-6 rounded-xl bg-gray-900 border border-white/10">
                    <h3 className="text-gray-400">Pending Review</h3>
                    <p className="text-4xl font-bold text-yellow-400">120</p>
                </div>
            </div>
        </div>
    )
}
