'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, FileText, User } from 'lucide-react'

export default function AdminScripts() {
    const params = useParams()
    const lang = params.lang as string
    const supabase = createClient()

    // Form state
    const [mode, setMode] = useState<'single' | 'bulk-text' | 'bulk-excel'>('single')
    const [title, setTitle] = useState('')
    const [contentAr, setContentAr] = useState('')
    const [bulkText, setBulkText] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // Changed to array

    // Data state
    const [scripts, setScripts] = useState<any[]>([])
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)

    const fetchAll = async () => {
        setLoading(true)
        const [scriptsRes, profilesRes] = await Promise.all([
            // Fetch scripts with their assignments
            supabase.from('scripts').select('*, script_assignments(user_id, profiles(full_name))').order('id', { ascending: true }),
            supabase.from('profiles').select('*').order('full_name', { ascending: true })
        ])

        if (scriptsRes.data) setScripts(scriptsRes.data)
        if (profilesRes.data) setProfiles(profilesRes.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const assignUsersToScripts = async (scriptIds: number[]) => {
        if (selectedUsers.length === 0 || scriptIds.length === 0) return

        const assignments = []
        for (const scriptId of scriptIds) {
            for (const userId of selectedUsers) {
                assignments.push({ script_id: scriptId, user_id: userId })
            }
        }

        const { error } = await supabase.from('script_assignments').insert(assignments)
        if (error) console.error('Error assigning users:', error)
    }

    const handleSingleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setImporting(true)

        const payload: any = {
            title: title || 'Untitled Script',
            content_en: '.',
            content_ar: contentAr,
            difficulty: 'easy',
            category: 'General',
        }

        const { data, error } = await supabase.from('scripts').insert(payload).select()

        if (!error && data) {
            await assignUsersToScripts([data[0].id])
            alert('Added!')
            setTitle('')
            setContentAr('')
            setSelectedUsers([])
            fetchAll()
        } else {
            alert('Error adding script: ' + error?.message)
        }
        setImporting(false)
    }

    const handleBulkText = async () => {
        if (!bulkText.trim()) return
        setImporting(true)

        const lines = bulkText.split('\n').filter(line => line.trim().length > 0)
        const payloads = lines.map((line, idx) => ({
            title: `Bulk Import ${idx + 1}`,
            content_en: '.',
            content_ar: line.trim(),
            difficulty: 'easy',
            category: 'General',
        }))

        const { data, error } = await supabase.from('scripts').insert(payloads).select()

        if (!error && data) {
            const newScriptIds = data.map(s => s.id)
            await assignUsersToScripts(newScriptIds)

            alert(`Successfully imported ${lines.length} scripts!`)
            setBulkText('')
            setSelectedUsers([])
            fetchAll()
        } else {
            alert('Error importing scripts: ' + error?.message)
        }
        setImporting(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws) as any[]

                const payloads = data.map((row, idx) => ({
                    title: row.title || `Excel Import ${idx + 1}`,
                    content_en: '.',
                    content_ar: row.content || row.content_ar || '',
                    difficulty: 'easy',
                    category: 'General',
                })).filter(p => p.content_ar)

                if (payloads.length === 0) {
                    alert('No valid rows found.')
                    setImporting(false)
                    return
                }

                const { data: insertedData, error } = await supabase.from('scripts').insert(payloads).select()

                if (!error && insertedData) {
                    const newScriptIds = insertedData.map(s => s.id)
                    await assignUsersToScripts(newScriptIds)

                    alert(`Successfully imported ${payloads.length} scripts from Excel!`)
                    setSelectedUsers([])
                    fetchAll()
                } else {
                    alert('Error importing from Excel: ' + error?.message)
                }
            } catch (err) {
                console.error(err)
                alert('Failed to parse Excel file')
            }
            setImporting(false)
        }
        reader.readAsBinaryString(file)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this script?')) return

        const { error } = await supabase
            .from('scripts')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Error deleting script')
        } else {
            setScripts(prev => prev.filter(s => s.id !== id))
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Manage Scripts</h1>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="xl:col-span-1 border-r border-white/10 pr-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-8">
                        <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg">
                            <button
                                onClick={() => setMode('single')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'single' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Single
                            </button>
                            <button
                                onClick={() => setMode('bulk-text')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'bulk-text' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Bulk Text
                            </button>
                            <button
                                onClick={() => setMode('bulk-excel')}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'bulk-excel' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Excel
                            </button>
                        </div>

                        {/* Common: Assign Users (Multi-select) */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Assign to Users (Selected: {selectedUsers.length})
                            </label>
                            <div className="max-h-48 overflow-y-auto bg-black/20 border border-white/10 rounded p-2 custom-scrollbar">
                                {profiles.map(p => (
                                    <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(p.id)}
                                            onChange={() => toggleUser(p.id)}
                                            className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
                                        />
                                        <span className="text-sm text-gray-300">{p.full_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {mode === 'single' && (
                            <form onSubmit={handleSingleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 focus:border-indigo-500 outline-none transition-colors"
                                        placeholder="Script Title (Optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Arabic Content</label>
                                    <textarea
                                        value={contentAr}
                                        onChange={e => setContentAr(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 h-32 text-right focus:border-indigo-500 outline-none transition-colors"
                                        placeholder="...النص العربي"
                                        required
                                    />
                                </div>
                                <button disabled={importing} type="submit" className="w-full bg-indigo-600 py-2.5 rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50">
                                    {importing ? 'Adding...' : 'Add Script'}
                                </button>
                            </form>
                        )}

                        {mode === 'bulk-text' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Paste Scripts (One per line)</label>
                                    <textarea
                                        value={bulkText}
                                        onChange={e => setBulkText(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded p-2 h-64 text-right focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                                        placeholder="...النص العربي 1&#10;...النص العربي 2&#10;...النص العربي 3"
                                    />
                                </div>
                                <button disabled={importing} onClick={handleBulkText} className="w-full bg-indigo-600 py-2.5 rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50">
                                    {importing ? 'Importing...' : 'Import All Lines'}
                                </button>
                            </div>
                        )}

                        {mode === 'bulk-excel' && (
                            <div className="space-y-6 text-center py-8 border-2 border-dashed border-white/10 rounded-xl hover:border-indigo-500/50 transition-colors group">
                                <FileSpreadsheet className="w-12 h-12 text-gray-500 mx-auto group-hover:text-indigo-400 transition-colors" />
                                <div>
                                    <p className="text-gray-300 font-medium">Upload Excel File (.xlsx)</p>
                                    <p className="text-xs text-gray-500 mt-1">Columns: content (req), title (opt)</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    disabled={importing}
                                    className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-indigo-500/10 file:text-indigo-400
                                      hover:file:bg-indigo-500/20
                                      cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* List Section */}
                <div className="xl:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">All Scripts ({scripts.length})</h2>
                            <button onClick={fetchAll} className="text-xs text-indigo-400 hover:text-indigo-300">Refresh</button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-black/20 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Content</th>
                                        <th className="p-4">Assigned To</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading scripts...</td></tr>
                                    ) : scripts.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No scripts found</td></tr>
                                    ) : (
                                        scripts.map(script => (
                                            <tr key={script.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-gray-400 font-mono">{script.id}</td>
                                                <td className="p-4 font-medium text-white">{script.title}</td>
                                                <td className="p-4 text-gray-400 max-w-xs truncate" dir="rtl">
                                                    {script.content_ar}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {script.script_assignments && script.script_assignments.length > 0 ? (
                                                            script.script_assignments.map((assign: any) => (
                                                                <span key={assign.user_id} className="inline-flex items-center px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs">
                                                                    {assign.profiles?.full_name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-600 text-xs italic">Unassigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(script.id)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
