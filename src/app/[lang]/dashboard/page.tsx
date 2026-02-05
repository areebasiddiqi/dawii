'use client'

import { createClient } from '@/utils/supabase/client'
import VoiceRecorder from '@/components/voice-recorder'
import RecordingsList from '@/components/recordings-list'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function DashboardPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string
    const isAr = lang === 'ar'
    const t = {
        welcome: isAr ? 'أهلاً بك' : 'Welcome back',
        points: isAr ? 'نقاطك' : 'Your Points',
        tasks: isAr ? 'المتوفرة' : 'Available Scripts',
        start: isAr ? 'تسجيل' : 'Record',
        stop: isAr ? 'إيقاف' : 'Stop',
        play: isAr ? 'استماع' : 'Listen',
        reset: isAr ? 'إعادة' : 'Reset',
        upload: isAr ? 'رفع' : 'Upload',
        next: isAr ? 'التالي' : 'Next',
        delete: isAr ? 'حذف' : 'Delete',
        logout: isAr ? 'تسجيل الخروج' : 'Logout',
    }

    interface Profile {
        id: string
        full_name: string
        role: string
        points: number
    }

    interface Script {
        id: number
        content_en: string
        content_ar: string
        difficulty: string
        category: string
    }

    const [uploading, setUploading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentScript, setCurrentScript] = useState<Script | null>(null)
    const [allScripts, setAllScripts] = useState<Script[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()

            if (error || !user) {
                router.push(`/${lang}/login`)
                return
            }

            setUser(user)

            // Load profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // If profile doesn't exist, create it (fallback for users created before trigger)
            if (profileError && profileError.code === 'PGRST116') {
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || user.email || '',
                        role: 'contributor',
                        points: 0
                    })
                    .select()
                    .single()

                setProfile(newProfile as Profile)
            } else {
                setProfile(profileData as Profile)
            }

            // Load all scripts
            const { data: scriptsData } = await supabase
                .from('scripts')
                .select('*')
                .order('id', { ascending: true })

            if (scriptsData && scriptsData.length > 0) {
                setAllScripts(scriptsData)
                setCurrentScript(scriptsData[0])
            }

            setLoading(false)
        }

        loadUser()
    }, [lang, router])

    const handleNextScript = () => {
        if (currentIndex < allScripts.length - 1) {
            const newIndex = currentIndex + 1
            setCurrentIndex(newIndex)
            setCurrentScript(allScripts[newIndex])
        }
    }

    const handlePrevScript = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1
            setCurrentIndex(newIndex)
            setCurrentScript(allScripts[newIndex])
        }
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push(`/${lang}/`)
        router.refresh()
    }

    const handleUpload = async (audioBlob: Blob) => {
        setUploading(true)
        const supabase = createClient()

        try {
            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) {
                alert('Please log in to upload recordings')
                setUploading(false)
                return
            }

            // 1. Upload to Storage
            const filename = `${user.id}/${Date.now()}.webm`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recordings')
                .upload(filename, audioBlob)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                alert('Error uploading audio: ' + uploadError.message)
                setUploading(false)
                return
            }

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('recordings')
                .getPublicUrl(filename)

            // Calculate Points Logic
            let pointsEarned = 0
            let durationValid = true

            if (currentScript) {
                // Word Count (approx)
                const wordCount = (currentScript.content_en || '').split(/\s+/).length

                // Difficulty Multiplier
                let multiplier = 1
                const diff = (currentScript.difficulty || 'easy').toLowerCase()
                if (diff === 'medium') multiplier = 1.5
                if (diff === 'hard') multiplier = 2

                // Duration Check (Audio Quality Proxy)
                // Estimate: 2.5 words per second (150 wpm)
                // We'll accept a generous range: 0.5x to 2.5x the estimated time
                const estimatedSecs = wordCount / 2.5
                const audioDuration = await getBlobDuration(audioBlob)

                // If duration is too short (< 0.5x) or too long (> 2.5x), we consider it 'poor quality' or invalid
                if (audioDuration < estimatedSecs * 0.5 || audioDuration > estimatedSecs * 2.5) {
                    durationValid = false
                } else {
                    // Formula: Base 10 per word * Multiplier? No, that's too high. 
                    // Let's say Base 1 point per word * Multiplier. 
                    // Example: 50 words * 1.5 = 75 points.
                    pointsEarned = Math.round(wordCount * multiplier)
                }
            }

            // 3. Insert record in DB
            const { error: dbError } = await supabase
                .from('recordings')
                .insert({
                    user_id: user.id,
                    script_id: currentScript?.id || 1,
                    audio_url: publicUrl,
                    status: 'approved' // Auto-approve
                })

            if (dbError) {
                console.error('Database error:', dbError)
                alert('Error saving recording: ' + dbError.message)
                setUploading(false)
                return
            }

            // 4. Award points if valid
            if (pointsEarned > 0 && durationValid) {
                const { error: pointsError } = await supabase
                    .from('profiles')
                    .update({ points: (profile?.points || 0) + pointsEarned })
                    .eq('id', user.id)

                if (!pointsError) {
                    setProfile(prev => {
                        if (!prev) return null
                        return {
                            ...prev,
                            points: prev.points + pointsEarned
                        }
                    })
                    alert(`Uploaded successfully! You earned ${pointsEarned} points! 🎉`)
                }
            } else {
                alert('Uploaded successfully! No points awarded due to audio length mismatch (too short or too long for script).')
            }

            setUploading(false)
            // window.location.reload() // Optional: reload to refresh list

        } catch (err) {
            console.error('Unexpected error:', err)
            alert('An unexpected error occurred')
            setUploading(false)
        }
    }

    // Process audio duration helper
    const getBlobDuration = (blob: Blob): Promise<number> => {
        return new Promise(resolve => {
            const audio = document.createElement('audio')
            audio.src = URL.createObjectURL(blob)
            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(audio.src)
                resolve(audio.duration)
            }
            audio.onerror = () => resolve(0)
        })
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-white text-lg">Loading...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        {t.welcome}
                    </h1>
                    {profile?.full_name && (
                        <p className="text-gray-400 mt-1">{profile.full_name}</p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2">
                        <span className="text-gray-400 text-sm uppercase tracking-wider">{t.points}</span>
                        <span className="ml-3 text-2xl font-bold text-white">{profile?.points || 0}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        {t.logout}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Script Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/10 backdrop-blur-xl">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-4 block">Current Script</span>
                    <p className="text-2xl md:text-3xl leading-relaxed text-white font-serif">
                        {currentScript ? (isAr ? currentScript.content_ar : currentScript.content_en) : 'Loading script...'}
                    </p>
                    {currentScript && (
                        <div className="mt-8 flex justify-between items-end">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs capitalize">{currentScript.difficulty}</span>
                                <span className="px-3 py-1 rounded-full bg-white/10 text-xs">{isAr ? 'عربي' : 'English'}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevScript}
                                    disabled={currentIndex === 0}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAr ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} /></svg>
                                </button>
                                <span className="flex items-center text-sm text-indigo-200">
                                    {currentIndex + 1} / {allScripts.length}
                                </span>
                                <button
                                    onClick={handleNextScript}
                                    disabled={currentIndex === allScripts.length - 1}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAr ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recorder Area */}
                <div className="flex flex-col items-center justify-center">
                    <VoiceRecorder
                        onRecordingComplete={handleUpload}
                        onNext={handleNextScript}
                        t={t}
                    />
                    {uploading && <p className="mt-4 text-indigo-400 animate-pulse">Uploading...</p>}
                </div>
            </div>

            {/* Recordings List */}
            {user && <RecordingsList userId={user.id} lang={lang} />}

        </div>
    )
}
