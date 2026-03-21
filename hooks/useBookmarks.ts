'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Bookmark } from '@/types'

export function useBookmarks(collectionId: string | null) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const collectionIdRef = useRef(collectionId)
  collectionIdRef.current = collectionId
  const lengthRef = useRef(0)
  lengthRef.current = bookmarks.length

  useEffect(() => {
    if (!collectionId) {
      setBookmarks([])
      return
    }
    setLoading(true)
    setError(null)
    supabase
      .from('bookmarks')
      .select('*')
      .eq('collection_id', collectionId)
      .is('archived_at', null)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setBookmarks(data ?? [])
        setLoading(false)
      })
  }, [collectionId])

  const createBookmark = useCallback(async (url: string): Promise<Bookmark | null> => {
    const cid = collectionIdRef.current
    if (!cid) return null

    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`

    let title: string | null = normalizedUrl
    let domain: string | null = null

    try {
      domain = new URL(normalizedUrl).hostname.replace(/^www\./, '')
    } catch {
      // keep domain null for malformed URLs
    }

    try {
      const res = await fetch(`/api/fetch-title?url=${encodeURIComponent(normalizedUrl)}`)
      if (res.ok) {
        const json = (await res.json()) as { title: string; domain: string }
        title = json.title
        domain = json.domain
      }
    } catch {
      // fall back to the values already set above
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        collection_id: cid,
        url: normalizedUrl,
        title,
        domain,
        sort_order: lengthRef.current,
      })
      .select()
      .single()

    if (error || !data) return null
    setBookmarks(prev => [...prev, data])
    return data
  }, [])

  const archiveBookmark = useCallback(async (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    await supabase.from('bookmarks').update({ archived_at: new Date().toISOString() }).eq('id', id)
  }, [])

  const reorderBookmarks = useCallback(async (reordered: Bookmark[]) => {
    setBookmarks(reordered)
    await Promise.all(
      reordered.map((b, i) =>
        supabase.from('bookmarks').update({ sort_order: i }).eq('id', b.id)
      )
    )
  }, [])

  return { bookmarks, loading, error, createBookmark, archiveBookmark, reorderBookmarks }
}
