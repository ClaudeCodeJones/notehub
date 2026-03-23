'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project, Note } from '@/types'

interface UseRealtimeOptions {
  onProjectInsert: (p: Project) => void
  onProjectUpdate: (p: Project) => void
  onProjectDelete: (id: string) => void
  onNoteInsert: (n: Note) => void
  onNoteUpdate: (n: Note) => void
  onNoteDelete: (id: string) => void
}

export function useRealtime({
  onProjectInsert,
  onProjectUpdate,
  onProjectDelete,
  onNoteInsert,
  onNoteUpdate,
  onNoteDelete,
}: UseRealtimeOptions) {
  const cbRef = useRef({ onProjectInsert, onProjectUpdate, onProjectDelete, onNoteInsert, onNoteUpdate, onNoteDelete })

  // Keep ref current without re-creating the channel
  useEffect(() => {
    cbRef.current = { onProjectInsert, onProjectUpdate, onProjectDelete, onNoteInsert, onNoteUpdate, onNoteDelete }
  })

  useEffect(() => {
    const channel = supabase
      .channel('notehub-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, payload =>
        cbRef.current.onProjectInsert(payload.new as Project)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, payload =>
        cbRef.current.onProjectUpdate(payload.new as Project)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' }, payload =>
        cbRef.current.onProjectDelete((payload.old as { id: string }).id)
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, payload =>
        cbRef.current.onNoteInsert(payload.new as Note)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, payload =>
        cbRef.current.onNoteUpdate(payload.new as Note)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, payload =>
        cbRef.current.onNoteDelete((payload.old as { id: string }).id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // channel is created once; callbacks are always current via cbRef
}
