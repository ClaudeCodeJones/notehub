'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export function useNotes(projectId: string | null, vaultId?: string | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const projectIdRef = useRef(projectId)
  projectIdRef.current = projectId
  const vaultIdRef = useRef(vaultId)
  vaultIdRef.current = vaultId
  const lengthRef = useRef(0)
  lengthRef.current = notes.length

  useEffect(() => {
    const activeId = vaultId ?? projectId
    if (!activeId) {
      setNotes([])
      return
    }
    setLoading(true)
    setError(null)
    const query = supabase
      .from('notes')
      .select('*')
      .is('archived_at', null)
      .order('sort_order', { ascending: true })
    const filtered = vaultId
      ? query.eq('vault_id', vaultId)
      : query.eq('project_id', projectId!)
    filtered.then(({ data, error }) => {
      if (error) setError(error.message)
      else setNotes(data ?? [])
      setLoading(false)
    }).catch(err => {
      setError(err?.message ?? 'Failed to load notes')
      setLoading(false)
    })
  }, [projectId, vaultId])

  const createNote = useCallback(async (noteType: 'checkbox' | 'note' | 'text' = 'checkbox'): Promise<Note | null> => {
    const vid = vaultIdRef.current
    const pid = projectIdRef.current
    if (!vid && !pid) return null
    const checkboxContent = '{"type":"doc","content":[{"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph"}]}]}]}'
    const noteContent = '{"type":"doc","content":[{"type":"paragraph"}]}'
    const content = noteType === 'checkbox' ? checkboxContent : noteContent
    const base = { title: '', content, note_type: noteType, sort_order: lengthRef.current }
    const insertData = vid ? { ...base, vault_id: vid } : { ...base, project_id: pid! }
    const { data, error } = await supabase
      .from('notes')
      .insert(insertData)
      .select()
      .single()
    if (error || !data) return null
    setNotes(prev => prev.some(n => n.id === data.id) ? prev : [...prev, data])
    return data
  }, [])

  const updateNote = useCallback(async (
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content'>>
  ) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)))
    await supabase.from('notes').update(updates).eq('id', id)
  }, [])

  const updateNoteType = useCallback(async (id: string, note_type: 'checkbox' | 'note' | 'text') => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, note_type } : n)))
    await supabase.from('notes').update({ note_type }).eq('id', id)
  }, [])

  const archiveNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').update({ archived_at: new Date().toISOString() }).eq('id', id)
  }, [])

  const pinNote = useCallback(async (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: true } : n))
    await supabase.from('notes').update({ pinned: true }).eq('id', id)
  }, [])

  const unpinNote = useCallback(async (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: false } : n))
    await supabase.from('notes').update({ pinned: false }).eq('id', id)
  }, [])

  const reorderNotes = useCallback(async (reordered: Note[]) => {
    setNotes(reordered)
    await Promise.all(
      reordered.map((n, i) =>
        supabase.from('notes').update({ sort_order: i }).eq('id', n.id)
      )
    )
  }, [])

  const updateFromRealtime = useCallback((updated: Note) => {
    setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)))
  }, [])

  const insertFromRealtime = useCallback((inserted: Note) => {
    setNotes(prev => {
      if (prev.some(n => n.id === inserted.id)) return prev
      const matchesProject = inserted.project_id !== null && inserted.project_id === projectIdRef.current
      const matchesVault = inserted.vault_id !== null && inserted.vault_id === vaultIdRef.current
      if (!matchesProject && !matchesVault) return prev
      return [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order)
    })
  }, [])

  const deleteFromRealtime = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    updateNoteType,
    archiveNote,
    pinNote,
    unpinNote,
    reorderNotes,
    updateFromRealtime,
    insertFromRealtime,
    deleteFromRealtime,
  }
}
