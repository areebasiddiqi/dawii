'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Loader } from 'lucide-react'

interface Recording {
    id: number
    created_at: string
    audio_url: string
    status: 'pending' | 'approved' | 'rejected'
    feedback: string | null
    script_id: number
}

interface RecordingsListProps {
    userId: string
    lang: string
}

export default function RecordingsList({ userId, lang }: RecordingsListProps) {
    const [recordings, setRecordings] = useState<Recording[]>([])
    const [loading, setLoading] = useState(true)
    const isAr = lang === 'ar'

    const t = {
        title: isAr ? 'تسجيلاتك' : 'Your Recordings',
        date: isAr ? 'التاريخ' : 'Date',
        noRecordings: isAr ? 'لا توجد تسجيلات بعد' : 'No recordings yet',
        play: isAr ? 'تشغيل' : 'Play',
    }

    useEffect(() => {
        async function loadRecordings() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('recordings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setRecordings(data)
            }
            setLoading(false)
        }

        loadRecordings()
    }, [userId])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
        )
    }

    const parseFilenameInfo = (url: string) => {
        try {
            // Expected format: .../ss_mm_hh_DD_MM_YYYY_Name.webm
            const filename = url.split('/').pop() || ''
            const parts = filename.replace('.webm', '').split('_')

            if (parts.length >= 7) {
                // ss_mm_hh_DD_MM_YYYY_Name
                const [ss, mm, hh, DD, MM, YYYY, ...nameParts] = parts
                const name = nameParts.join(' ')
                return {
                    time: `${hh}:${mm}:${ss}`,
                    date: `${DD}/${MM}/${YYYY}`,
                    name: name
                }
            }
            return null
        } catch (e) {
            return null
        }
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">{t.title}</h2>

            {recordings.length === 0 ? (
                <div className="text-center p-12 border border-white/10 rounded-xl bg-white/5">
                    <p className="text-gray-400">{t.noRecordings}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recordings.map((recording) => {
                        const info = parseFilenameInfo(recording.audio_url)
                        return (
                            <div
                                key={recording.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        {info ? (
                                            <div className="flex flex-col gap-1">
                                                <p className="text-white font-mono font-medium">{info.time}</p>
                                                <div className="flex gap-3 text-sm text-gray-400">
                                                    <span>{info.date}</span>
                                                    <span className="text-indigo-400">{info.name}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-white font-medium">{formatDate(recording.created_at)}</p>
                                        )}
                                    </div>
                                    <audio controls src={recording.audio_url} className="h-10 w-full max-w-xs" />
                                </div>
                                {recording.feedback && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className="text-sm text-gray-400">{recording.feedback}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
