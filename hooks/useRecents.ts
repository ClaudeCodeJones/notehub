'use client'

import { useState, useCallback, useEffect } from 'react'

export interface RecentEntry {
  id: string
  type: 'project' | 'collection' | 'vault'
}

const STORAGE_KEY = 'notehub_recents'
const MAX_RECENTS = 3

export function useRecents() {
  const [recents, setRecents] = useState<RecentEntry[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      setRecents(stored)
    } catch {
      setRecents([])
    }
  }, [])

  const recordRecent = useCallback((entry: RecentEntry) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.id !== entry.id)
      const next = [entry, ...filtered].slice(0, MAX_RECENTS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { recents, recordRecent }
}
