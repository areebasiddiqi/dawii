'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, RotateCcw, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void
    t: {
        start: string,
        stop: string,
        play: string,
        reset: string,
        upload: string
    }
}

export default function VoiceRecorder({ onRecordingComplete, t }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [audioURL, setAudioURL] = useState<string | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const dataArrayRef = useRef<Uint8Array | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Start Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Setup Audio Context for Visualizer
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const analyser = audioContext.createAnalyser()
            const source = audioContext.createMediaStreamSource(stream)
            source.connect(analyser)
            analyser.fftSize = 256

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount as number)

            // Setup MediaRecorder
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const url = URL.createObjectURL(audioBlob)
                setAudioURL(url)
                onRecordingComplete(audioBlob)

                // Cleanup Audio Context
                if (audioContextRef.current) {
                    audioContextRef.current.close()
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current)
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setElapsedTime(0)

            // Timer
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)

            // Start Visualizer
            drawVisualizer()

        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("Microphone access denied or not available.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const analyser = analyserRef.current
        const dataArray = dataArrayRef.current

        analyser.getByteFrequencyData(dataArray as any)

        if (ctx) {
            ctx.clearRect(0, 0, width, height)
            const barWidth = (width / dataArray.length) * 2.5
            let barHeight
            let x = 0

            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i] / 2

                // Premium Gradient/Color
                const gradient = ctx.createLinearGradient(0, 0, 0, height)
                gradient.addColorStop(0, '#a855f7') // Purple-500
                gradient.addColorStop(1, '#6366f1') // Indigo-500

                ctx.fillStyle = gradient
                ctx.fillRect(x, height - barHeight, barWidth, barHeight)

                x += barWidth + 1
            }
        }

        animationFrameRef.current = requestAnimationFrame(drawVisualizer)
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            setIsPlaying(false)
        }
    }, [audioURL])

    const handlePlayPause = () => {
        if (!audioRef.current || !audioURL) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true)
                    })
                    .catch(error => {
                        console.error("Playback failed:", error)
                        setIsPlaying(false)
                    })
            }
        }
    }

    const handleReset = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        setAudioURL(null)
        setElapsedTime(0)
        setIsPlaying(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm w-full max-w-md">
            <canvas
                ref={canvasRef}
                width={300}
                height={100}
                className="w-full h-24 mb-4 rounded bg-black/20"
            />

            <div className="text-3xl font-mono text-white mb-6">
                {formatTime(elapsedTime)}
            </div>

            <audio
                ref={audioRef}
                src={audioURL || ''}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />

            <div className="flex gap-4">
                {!isRecording && !audioURL && (
                    <button onClick={startRecording} className="flex flex-col items-center gap-2 group">
                        <div className="p-4 rounded-full bg-red-500 group-hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-gray-400">{t.start}</span>
                    </button>
                )}

                {isRecording && (
                    <button onClick={stopRecording} className="flex flex-col items-center gap-2 group">
                        <div className="p-4 rounded-full bg-gray-700 group-hover:bg-gray-600 transition-all border border-white/10">
                            <Square className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm text-gray-400">{t.stop}</span>
                    </button>
                )}

                {audioURL && (
                    <>
                        <button onClick={handlePlayPause} className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-all">
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white fill-white" />
                            ) : (
                                <Play className="w-5 h-5 text-white fill-white" />
                            )}
                        </button>

                        <button onClick={handleReset} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
                            <RotateCcw className="w-5 h-5 text-white" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
