'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note } from '@/types'

export function useNotes(projectId: string | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const projectIdRef = useRef(projectId)
  projectIdRef.current = projectId
  const lengthRef = useRef(0)
  lengthRef.current = notes.length

  useEffect(() => {
    if (!projectId) {
      setNotes([])
      return
    }
    setLoading(true)
    setError(null)
    supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setNotes(data ?? [])
        setLoading(false)
      })
  }, [projectId])

  const createNote = useCallback(async (): Promise<Note | null> => {
    const pid = projectIdRef.current
    if (!pid) return null
    const { data, error } = await supabase
      .from('notes')
      .insert({ project_id: pid, title: '', content: '{"type":"doc","content":[{"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph"}]}]}]}', sort_order: lengthRef.current })
      .select()
      .single()
    if (error || !data) return null
    setNotes(prev => [...prev, data])
    return data
  }, [])

  const updateNote = useCallback(async (
    id: string,
    updates: Partial<Pick<Note, 'title' | 'content'>>
  ) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)))
    await supabase.from('notes').update(updates).eq('id', id)
  }, [])

  const deleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').delete().eq('id', id)
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
      if (inserted.project_id !== projectIdRef.current) return prev
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
    deleteNote,
    reorderNotes,
    updateFromRealtime,
    insertFromRealtime,
    deleteFromRealtime,
  }
}
