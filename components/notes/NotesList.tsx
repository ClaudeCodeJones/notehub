'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, FileText, ChevronLeft } from 'lucide-react'
import { NoteItem } from './NoteItem'
import type { Note, Project, VaultItem } from '@/types'

type NoteType = 'checkbox' | 'note'
const STORAGE_KEY = 'notehub-last-note-type'

interface NotesListProps {
  project: Project | VaultItem | null
  notes: Note[]
  activeNoteId: string | null
  loading: boolean
  onSelectNote: (id: string) => void
  onCreateNote: (type: NoteType) => void
  onArchiveNote: (id: string) => Promise<void>
  onReorderNotes: (notes: Note[]) => void
  onMobileBack?: () => void
}

export function NotesList({
  project,
  notes,
  activeNoteId,
  loading,
  onSelectNote,
  onCreateNote,
  onArchiveNote,
  onReorderNotes,
  onMobileBack,
}: NotesListProps) {
  const [lastType, setLastType] = useState<NoteType>('checkbox')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'note' || stored === 'checkbox') setLastType(stored)
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = notes.findIndex(n => n.id === active.id)
    const newIndex = notes.findIndex(n => n.id === over.id)
    onReorderNotes(arrayMove(notes, oldIndex, newIndex))
  }

  if (!project) {
    return (
      <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col items-center justify-center border-r border-[var(--color-border)] bg-[#e8e8e8] h-full gap-2">
        <FileText size={28} className="text-[var(--color-text-muted)]" style={{ opacity: 0.5 }} />
        <p className="text-xs text-[var(--color-text-muted)]">Select a project</p>
      </div>
    )
  }

  return (
    <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[#e8e8e8] h-full">
      {/* Header */}
      <div className="relative px-4 h-[88px] border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm" style={{ backgroundColor: project.color }} />
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMobileBack}
            className="md:hidden p-1 -ml-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
            {project.name}
          </h2>
        </div>
        <button
          onClick={() => onCreateNote(lastType)}
          title="New note"
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Notes */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-[var(--color-text-muted)]">Loading…</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-[var(--color-text-muted)]">No notes yet</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={notes.map(n => n.id)}
              strategy={verticalListSortingStrategy}
            >
              {notes.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  projectColor={project.color}
                  onSelect={onSelectNote}
                  onArchive={onArchiveNote}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

    </div>
  )
}
