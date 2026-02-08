/**
 * Utility functions for statistics calculations
 */

export interface Recording {
    id: number
    audio_url: string
    created_at: string
    duration?: number
}

/**
 * Format seconds to HH:MM:SS or MM:SS format
 */
export function formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0:00:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate completion rate percentage
 */
export function calculateCompletionRate(recorded: number, total: number): number {
    if (total === 0) return 0
    return Math.round((recorded / total) * 100 * 10) / 10 // Round to 1 decimal
}

/**
 * Get audio duration from a blob or audio element
 */
export function getAudioDuration(blob: Blob): Promise<number> {
    return new Promise((resolve) => {
        const audio = document.createElement('audio')
        audio.src = URL.createObjectURL(blob)
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(audio.src)
            resolve(audio.duration)
        }
        audio.onerror = () => {
            URL.revokeObjectURL(audio.src)
            resolve(0)
        }
    })
}

/**
 * Get audio duration from URL
 */
export function getAudioDurationFromUrl(url: string): Promise<number> {
    return new Promise((resolve) => {
        const audio = new Audio(url)
        audio.onloadedmetadata = () => {
            resolve(audio.duration)
        }
        audio.onerror = () => resolve(0)
    })
}

/**
 * Aggregate statistics from recordings
 */
export function aggregateStats(recordings: any[]) {
    const totalRecordings = recordings.length

    // Calculate total duration (assuming duration is stored or calculated)
    const totalDuration = recordings.reduce((sum, rec) => {
        return sum + (rec.duration || 0)
    }, 0)

    const averageDuration = totalRecordings > 0 ? totalDuration / totalRecordings : 0

    return {
        totalRecordings,
        totalDuration,
        averageDuration,
        formattedTotalDuration: formatDuration(totalDuration),
        formattedAverageDuration: formatDuration(averageDuration)
    }
}
