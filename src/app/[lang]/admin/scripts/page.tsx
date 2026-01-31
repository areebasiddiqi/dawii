'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function AdminScripts() {
    const params = useParams()
    const lang = params.lang as string
    const supabase = createClient()

    // Form state
    const [title, setTitle] = useState('')
    const [contentEn, setContentEn] = useState('')
    const [contentAr, setContentAr] = useState('')
    // List state
    const [scripts, setScripts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchScripts = async () => {
        const { data } = await supabase
            .from('scripts')
            .select('*')
            .order('id', { ascending: true })

        if (data) setScripts(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchScripts()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from('scripts').insert({
            title,
            content_en: contentEn,
            content_ar: contentAr,
            difficulty: 'easy',
            category: 'General'
        })

        if (!error) {
            alert('Added!')
            setTitle('')
            setContentEn('')
            setContentAr('')
            fetchScripts() // Refresh list
        } else {
            alert('Error adding script')
        }
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
                {/* Form Section */}
                <div className="xl:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6">Add New Script</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-2 focus:border-indigo-500 outline-none transition-colors"
                                    placeholder="Script Title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">English Content</label>
                                <textarea
                                    value={contentEn}
                                    onChange={e => setContentEn(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded p-2 h-32 focus:border-indigo-500 outline-none transition-colors"
                                    placeholder="English text..."
                                    required
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
                            <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded-lg font-bold hover:bg-indigo-500 transition-colors">
                                Add Script
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="xl:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold">All Scripts ({scripts.length})</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-black/20 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Content Preview</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading scripts...</td></tr>
                                    ) : scripts.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No scripts found</td></tr>
                                    ) : (
                                        scripts.map(script => (
                                            <tr key={script.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-gray-400 font-mono">{script.id}</td>
                                                <td className="p-4 font-medium text-white">{script.title}</td>
                                                <td className="p-4 text-gray-400 max-w-xs truncate">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="truncate" dir="ltr">{script.content_en}</span>
                                                        <span className="truncate text-xs opacity-70" dir="rtl">{script.content_ar}</span>
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
