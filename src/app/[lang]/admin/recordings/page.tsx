'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download } from 'lucide-react'

export default function AdminRecordings() {
    const params = useParams()
    const lang = params.lang as string
    const supabase = createClient()
    const [recordings, setRecordings] = useState<any[]>([])

    useEffect(() => {
        const fetchRecordings = async () => {
            const { data } = await supabase
                .from('recordings')
                .select('*, scripts(title), user:profiles!user_id(full_name)')
                .order('created_at', { ascending: false })

            if (data) setRecordings(data)
        }
        fetchRecordings()
    }, [])

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = blobUrl
            link.download = filename || 'recording.wav'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Download error:', error)
            alert('Error downloading file')
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Recordings Review</h1>

            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                <table className="w-full text-left font-mono text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 bg-black/20">
                            <th className="p-4">ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Script</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Audio Playback</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recordings.map(rec => (
                            <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-gray-400">{rec.id}</td>
                                <td className="p-4 text-indigo-400 font-medium">{rec.user?.full_name || 'Unknown User'}</td>
                                <td className="p-4 text-white font-medium">{rec.scripts?.title || 'Unknown Script'}</td>
                                <td className="p-4 text-gray-400">
                                    {new Date(rec.created_at).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <audio controls src={rec.audio_url} className="h-8 w-48 rounded" />
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDownload(rec.audio_url, `recording-${rec.id}.wav`)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors text-white font-medium"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {recordings.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No recordings found yet.
                    </div>
                )}
            </div>
        </div>
    )
}
