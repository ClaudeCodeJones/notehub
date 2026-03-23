'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Note, Bookmark } from '@/types'

export function useArchivedItems() {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([])
  const [archivedBookmarks, setArchivedBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArchived = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [notesRes, bookmarksRes] = await Promise.all([
      supabase.from('notes').select('*').not('archived_at', 'is', null).order('archived_at', { ascending: false }),
      supabase.from('bookmarks').select('*').not('archived_at', 'is', null).order('archived_at', { ascending: false }),
    ])
    if (notesRes.error) setError(notesRes.error.message)
    else setArchivedNotes(notesRes.data ?? [])
    if (bookmarksRes.error) setError(bookmarksRes.error.message)
    else setArchivedBookmarks(bookmarksRes.data ?? [])
    setLoading(false)
  }, [])

  const restoreNote = useCallback(async (id: string) => {
    setArchivedNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').update({ archived_at: null }).eq('id', id)
  }, [])

  const permanentDeleteNote = useCallback(async (id: string) => {
    setArchivedNotes(prev => prev.filter(n => n.id !== id))
    await supabase.from('notes').delete().eq('id', id)
  }, [])

  const restoreBookmark = useCallback(async (id: string) => {
    setArchivedBookmarks(prev => prev.filter(b => b.id !== id))
    await supabase.from('bookmarks').update({ archived_at: null }).eq('id', id)
  }, [])

  const permanentDeleteBookmark = useCallback(async (id: string) => {
    setArchivedBookmarks(prev => prev.filter(b => b.id !== id))
    await supabase.from('bookmarks').delete().eq('id', id)
  }, [])

  return {
    archivedNotes,
    archivedBookmarks,
    loading,
    error,
    fetchArchived,
    restoreNote,
    permanentDeleteNote,
    restoreBookmark,
    permanentDeleteBookmark,
  }
}
