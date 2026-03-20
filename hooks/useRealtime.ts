'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    const channel = supabase
      .channel('notehub-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, payload =>
        onProjectInsert(payload.new as Project)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, payload =>
        onProjectUpdate(payload.new as Project)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' }, payload =>
        onProjectDelete((payload.old as { id: string }).id)
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, payload =>
        onNoteInsert(payload.new as Note)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, payload =>
        onNoteUpdate(payload.new as Note)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, payload =>
        onNoteDelete((payload.old as { id: string }).id)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onProjectInsert, onProjectUpdate, onProjectDelete, onNoteInsert, onNoteUpdate, onNoteDelete])
}
