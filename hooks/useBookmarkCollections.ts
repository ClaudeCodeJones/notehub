'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PROJECT_COLORS } from '@/lib/constants'
import type { BookmarkCollection } from '@/types'

export function useBookmarkCollections() {
  const [collections, setCollections] = useState<BookmarkCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lengthRef = useRef(0)
  lengthRef.current = collections.length

  useEffect(() => {
    supabase
      .from('bookmark_collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setCollections(data ?? [])
        setLoading(false)
      })
  }, [])

  const createCollection = useCallback(async (name: string): Promise<BookmarkCollection | null> => {
    const color = PROJECT_COLORS[lengthRef.current % PROJECT_COLORS.length]
    const { data, error } = await supabase
      .from('bookmark_collections')
      .insert({ name, color, sort_order: lengthRef.current })
      .select()
      .single()
    if (error || !data) return null
    setCollections(prev => [...prev, data])
    return data
  }, [])

  const reorderCollections = useCallback(async (reordered: BookmarkCollection[]) => {
    setCollections(reordered)
    await Promise.all(
      reordered.map((c, i) =>
        supabase.from('bookmark_collections').update({ sort_order: i }).eq('id', c.id)
      )
    )
  }, [])

  const updateBookmarkCollection = useCallback(async (id: string, color: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, color } : c))
    await supabase.from('bookmark_collections').update({ color }).eq('id', id)
  }, [])

  return { collections, loading, error, createCollection, reorderCollections, updateBookmarkCollection }
}
