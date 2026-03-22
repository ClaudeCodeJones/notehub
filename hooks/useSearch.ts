'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface NoteResult {
  id: string
  title: string
  project_id: string | null
  vault_id: string | null
  note_type: 'checkbox' | 'note'
  updated_at: string
}

export interface BookmarkResult {
  id: string
  title: string | null
  url: string
  domain: string | null
  collection_id: string
  updated_at: string
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [noteResults, setNoteResults] = useState<NoteResult[]>([])
  const [bookmarkResults, setBookmarkResults] = useState<BookmarkResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setNoteResults([])
      setBookmarkResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [notesRes, bookmarksRes] = await Promise.all([
          supabase
            .from('notes')
            .select('id, title, project_id, vault_id, note_type, updated_at')
            .is('archived_at', null)
            .ilike('title', `%${query}%`)
            .order('updated_at', { ascending: false })
            .limit(20),
          supabase
            .from('bookmarks')
            .select('id, title, url, domain, collection_id, updated_at')
            .is('archived_at', null)
            .or(`title.ilike.%${query}%,url.ilike.%${query}%`)
            .order('updated_at', { ascending: false })
            .limit(20),
        ])
        setNoteResults(notesRes.data ?? [])
        setBookmarkResults(bookmarksRes.data ?? [])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return { query, setQuery, noteResults, bookmarkResults, loading }
}
