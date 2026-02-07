'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Download, Filter, X, CheckSquare, Square } from 'lucide-react'
import JSZip from 'jszip'

export default function AdminRecordings() {
    const params = useParams()
    const lang = params.lang as string
    const supabase = createClient()

    // Data state
    const [recordings, setRecordings] = useState<any[]>([])
    const [scripts, setScripts] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

    // Filter state
    const [filterScript, setFilterScript] = useState<string>('')
    const [filterUser, setFilterUser] = useState<string>('')
    const [filterDateFrom, setFilterDateFrom] = useState<string>('')
    const [filterDateTo, setFilterDateTo] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // Download state
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const [recordingsRes, scriptsRes, usersRes] = await Promise.all([
                supabase
                    .from('recordings')
                    .select('*, scripts(id, title), user:profiles!user_id(id, full_name, dialect)')
                    .order('created_at', { ascending: false }),
                supabase.from('scripts').select('id, title').order('title'),
                supabase.from('profiles').select('id, full_name').order('full_name')
            ])

            if (recordingsRes.data) setRecordings(recordingsRes.data)
            if (scriptsRes.data) setScripts(scriptsRes.data)
            if (usersRes.data) setUsers(usersRes.data)
        }
        fetchData()
    }, [])

    // Filter recordings
    const filteredRecordings = recordings.filter(rec => {
        if (filterScript && rec.scripts?.id?.toString() !== filterScript) return false
        if (filterUser && rec.user?.id !== filterUser) return false
        if (filterDateFrom && new Date(rec.created_at) < new Date(filterDateFrom)) return false
        if (filterDateTo && new Date(rec.created_at) > new Date(filterDateTo + 'T23:59:59')) return false
        return true
    })

    // Selection handlers
    const toggleSelection = (id: number) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredRecordings.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredRecordings.map(r => r.id)))
        }
    }

    const clearFilters = () => {
        setFilterScript('')
        setFilterUser('')
        setFilterDateFrom('')
        setFilterDateTo('')
    }

    const hasActiveFilters = filterScript || filterUser || filterDateFrom || filterDateTo

    // Single download handler
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

    // Bulk download handler
    const handleBulkDownload = async () => {
        if (selectedIds.size === 0) return

        setDownloading(true)
        try {
            const zip = new JSZip()
            const selectedRecordings = recordings.filter(r => selectedIds.has(r.id))

            // Fetch all audio files
            for (const rec of selectedRecordings) {
                try {
                    const response = await fetch(rec.audio_url)
                    const blob = await response.blob()
                    const filename = `recording-${rec.id}-${rec.user?.full_name || 'unknown'}.wav`
                    zip.file(filename, blob)
                } catch (error) {
                    console.error(`Failed to fetch recording ${rec.id}:`, error)
                }
            }

            // Generate ZIP file
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const zipUrl = window.URL.createObjectURL(zipBlob)

            // Download ZIP
            const link = document.createElement('a')
            link.href = zipUrl
            const timestamp = new Date().toISOString().split('T')[0]
            link.download = `recordings-${timestamp}-${selectedIds.size}-files.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(zipUrl)

            // Clear selection after successful download
            setSelectedIds(new Set())
        } catch (error) {
            console.error('Bulk download error:', error)
            alert('Error creating ZIP file')
        } finally {
            setDownloading(false)
        }
    }

    const allSelected = filteredRecordings.length > 0 && selectedIds.size === filteredRecordings.length

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Recordings Review</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters || hasActiveFilters
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    Filters {hasActiveFilters && `(${[filterScript, filterUser, filterDateFrom, filterDateTo].filter(Boolean).length})`}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Script</label>
                            <select
                                value={filterScript}
                                onChange={(e) => setFilterScript(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">All Scripts</option>
                                {scripts.map(s => (
                                    <option key={s.id} value={s.id.toString()}>{s.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">User</label>
                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">All Users</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">From Date</label>
                            <input
                                type="date"
                                value={filterDateFrom}
                                onChange={(e) => setFilterDateFrom(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">To Date</label>
                            <input
                                type="date"
                                value={filterDateTo}
                                onChange={(e) => setFilterDateTo(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-indigo-600/20 border border-indigo-500/50 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="text-indigo-300">
                        <span className="font-bold">{selectedIds.size}</span> recording{selectedIds.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                            Clear Selection
                        </button>
                        <button
                            onClick={handleBulkDownload}
                            disabled={downloading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            <Download className="w-4 h-4" />
                            {downloading ? 'Creating ZIP...' : 'Bulk Download'}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
                <table className="w-full text-left font-mono text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 bg-black/20">
                            <th className="p-4 w-12">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title={allSelected ? 'Deselect All' : 'Select All'}
                                >
                                    {allSelected ? (
                                        <CheckSquare className="w-5 h-5" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="p-4">ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Dialect</th>
                            <th className="p-4">Script</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Audio Playback</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRecordings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-gray-500">
                                    {hasActiveFilters ? 'No recordings match the selected filters.' : 'No recordings found yet.'}
                                </td>
                            </tr>
                        ) : (
                            filteredRecordings.map(rec => (
                                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(rec.id)}
                                            onChange={() => toggleSelection(rec.id)}
                                            className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800 cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-4 text-gray-400">{rec.id}</td>
                                    <td className="p-4 text-indigo-400 font-medium">{rec.user?.full_name || 'Unknown User'}</td>
                                    <td className="p-4">
                                        {rec.user?.dialect ? (
                                            <span className="px-2 py-1 rounded text-xs uppercase bg-white/10 text-gray-300 border border-white/5">
                                                {rec.user.dialect}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">—</span>
                                        )}
                                    </td>
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results Summary */}
            {hasActiveFilters && (
                <div className="mt-4 text-sm text-gray-400 text-center">
                    Showing {filteredRecordings.length} of {recordings.length} total recordings
                </div>
            )}
        </div>
    )
}
