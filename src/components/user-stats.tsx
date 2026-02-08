'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { formatDuration, calculateCompletionRate } from '@/lib/stats-utils'

interface UserStatsProps {
    userId: string
    lang: string
}

interface StatsData {
    totalLines: number
    recorded: number
    pending: number
    completionRate: number
    totalDuration: number
    averageDuration: number
    recordingsCount: number
}

export default function UserStats({ userId, lang }: UserStatsProps) {
    const [stats, setStats] = useState<StatsData>({
        totalLines: 0,
        recorded: 0,
        pending: 0,
        completionRate: 0,
        totalDuration: 0,
        averageDuration: 0,
        recordingsCount: 0
    })
    const [loading, setLoading] = useState(true)

    const isAr = lang === 'ar'

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient()

            try {
                // Get user's assigned scripts and all scripts
                const [assignmentsRes, allScriptsRes, recordingsRes] = await Promise.all([
                    supabase.from('script_assignments').select('script_id').eq('user_id', userId),
                    supabase.from('scripts').select('id'),
                    supabase.from('recordings').select('*').eq('user_id', userId)
                ])

                const allScripts = allScriptsRes.data || []
                const assignments = assignmentsRes.data || []
                const recordings = recordingsRes.data || []

                // Determine which scripts are available to the user
                let availableScripts: any[] = []

                if (assignments.length > 0) {
                    // User has specific assignments
                    const assignedScriptIds = assignments.map(a => a.script_id)
                    availableScripts = allScripts.filter(s => assignedScriptIds.includes(s.id))
                } else {
                    // No assignments means all unassigned scripts are available
                    // Get all assignments to find which scripts are assigned to others
                    const { data: allAssignments } = await supabase
                        .from('script_assignments')
                        .select('script_id')

                    const assignedToOthers = new Set((allAssignments || []).map(a => a.script_id))
                    availableScripts = allScripts.filter(s => !assignedToOthers.has(s.id))
                }

                const totalLines = availableScripts.length
                const recorded = recordings.length
                const pending = Math.max(0, totalLines - recorded)
                const completionRate = calculateCompletionRate(recorded, totalLines)

                // Calculate audio statistics
                // Note: We'll need to fetch actual durations from audio files
                // For now, we'll use a placeholder or stored duration if available
                let totalDuration = 0
                let recordingsWithDuration = 0

                // Try to get durations from recordings (if stored in DB)
                // Otherwise, we'd need to load each audio file which could be slow
                for (const recording of recordings) {
                    if (recording.duration) {
                        totalDuration += recording.duration
                        recordingsWithDuration++
                    }
                }

                // If no durations stored, we'll need to calculate from audio files
                // This is done asynchronously to avoid blocking
                if (recordingsWithDuration === 0 && recordings.length > 0) {
                    // Load a few samples to estimate
                    const sampleSize = Math.min(3, recordings.length)
                    let sampleDuration = 0

                    for (let i = 0; i < sampleSize; i++) {
                        try {
                            const duration = await getAudioDuration(recordings[i].audio_url)
                            sampleDuration += duration
                        } catch (e) {
                            console.error('Error loading audio duration:', e)
                        }
                    }

                    // Estimate total based on sample
                    if (sampleDuration > 0) {
                        totalDuration = (sampleDuration / sampleSize) * recordings.length
                    }
                }

                const averageDuration = recorded > 0 ? totalDuration / recorded : 0

                setStats({
                    totalLines,
                    recorded,
                    pending,
                    completionRate,
                    totalDuration,
                    averageDuration,
                    recordingsCount: recorded
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [userId])

    // Helper to get audio duration from URL
    const getAudioDuration = (url: string): Promise<number> => {
        return new Promise((resolve) => {
            const audio = new Audio(url)
            audio.onloadedmetadata = () => resolve(audio.duration)
            audio.onerror = () => resolve(0)
            // Timeout after 5 seconds
            setTimeout(() => resolve(0), 5000)
        })
    }

    if (loading) {
        return (
            <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-32 bg-white/5 rounded"></div>
            </div>
        )
    }

    const completionMessage = stats.completionRate === 100
        ? (isAr ? '🎉 رائع! لقد أكملت جميع التسجيلات!' : '🎉 Amazing! You\'ve completed all recordings!')
        : ''

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h2 className="text-2xl font-bold">{isAr ? 'تقدمك' : 'Your Progress'}</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30">
                    <h3 className="text-purple-300 text-sm mb-1">{isAr ? 'إجمالي السطور' : 'Total Lines'}</h3>
                    <p className="text-4xl font-bold text-purple-400">{stats.totalLines}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30">
                    <h3 className="text-green-300 text-sm mb-1">{isAr ? 'مسجل' : 'Recorded'}</h3>
                    <p className="text-4xl font-bold text-green-400">{stats.recorded}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30">
                    <h3 className="text-yellow-300 text-sm mb-1">{isAr ? 'معلق' : 'Pending'}</h3>
                    <p className="text-4xl font-bold text-yellow-400">{stats.pending}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/30">
                    <h3 className="text-pink-300 text-sm mb-1">{isAr ? 'مكتمل' : 'Complete'}</h3>
                    <p className="text-4xl font-bold text-pink-400">{stats.completionRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${stats.completionRate}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recording Progress Pie Chart */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">{isAr ? 'تقدم التسجيل' : 'Recording Progress'}</h3>

                    <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="rgba(234, 179, 8, 0.3)"
                                    strokeWidth="20"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="20"
                                    strokeDasharray={`${stats.completionRate * 2.513} ${251.3 - stats.completionRate * 2.513}`}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#059669" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-green-400">{stats.completionRate.toFixed(1)}%</span>
                                <span className="text-xs text-gray-400 mt-1">
                                    {isAr ? stats.pending > 0 ? 'معلق' : 'مكتمل' : stats.pending > 0 ? 'Pending' : 'Complete'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {completionMessage && (
                        <div className="mt-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-center text-sm">
                            {completionMessage}
                        </div>
                    )}
                </div>

                {/* Audio Stats */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🎧</span>
                        <h3 className="text-lg font-semibold">{isAr ? 'إحصائيات الصوت' : 'Audio Stats'}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">{isAr ? 'إجمالي المسجل:' : 'Total Recorded:'}</p>
                            <p className="text-2xl font-bold text-purple-400">{formatDuration(stats.totalDuration)}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-1">{isAr ? 'متوسط كل سطر:' : 'Average per line:'}</p>
                            <p className="text-2xl font-bold text-pink-400">{stats.averageDuration.toFixed(2)}s</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-1">{isAr ? 'التسجيلات:' : 'Recordings:'}</p>
                            <p className="text-2xl font-bold text-indigo-400">{stats.recordingsCount} {isAr ? 'ملف' : 'files'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
