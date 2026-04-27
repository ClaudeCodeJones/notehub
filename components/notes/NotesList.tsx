'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, ChevronLeft, CheckSquare, FileText, AlignLeft } from 'lucide-react'
import { NoteItem } from './NoteItem'
import { cn } from '@/lib/utils'
import type { Note, Project, VaultItem } from '@/types'

type NoteType = 'checkbox' | 'note' | 'text'

interface NotesListProps {
  project: Project | VaultItem | null
  notes: Note[]
  activeNoteId: string | null
  loading: boolean
  onSelectNote: (id: string) => void
  onCreateNote: (type: NoteType) => void
  onArchiveNote: (id: string) => Promise<void>
  onPinNote: (id: string) => Promise<void>
  onUnpinNote: (id: string) => Promise<void>
  onReorderNotes: (notes: Note[]) => void
  onMobileBack?: () => void
}

const NOTE_TYPE_OPTIONS: { type: NoteType; icon: React.ElementType; label: string }[] = [
  { type: 'checkbox', icon: CheckSquare, label: 'Checklist' },
  { type: 'note',     icon: FileText,    label: 'Note' },
  { type: 'text',     icon: AlignLeft,   label: 'Long note' },
]

export function NotesList({
  project,
  notes,
  activeNoteId,
  loading,
  onSelectNote,
  onCreateNote,
  onArchiveNote,
  onPinNote,
  onUnpinNote,
  onReorderNotes,
  onMobileBack,
}: NotesListProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const mobilePickerRef = useRef<HTMLDivElement>(null)

  const pinnedNotes = notes.filter(n => n.pinned)
  const unpinnedNotes = notes.filter(n => !n.pinned)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  useEffect(() => {
    if (!pickerOpen) return
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node
      const insideDesktop = pickerRef.current?.contains(target)
      const insideMobile = mobilePickerRef.current?.contains(target)
      if (!insideDesktop && !insideMobile) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [pickerOpen])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = unpinnedNotes.findIndex(n => n.id === active.id)
    const newIndex = unpinnedNotes.findIndex(n => n.id === over.id)
    onReorderNotes([...pinnedNotes, ...arrayMove(unpinnedNotes, oldIndex, newIndex)])
  }

  if (!project) {
    return (
      <div className="w-full md:w-[320px] flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full" />
    )
  }

  return (
    <div className="relative w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[#e8e8e8] h-full">
      {/* Header */}
      <div className="relative px-4 h-[88px] border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm" style={{ backgroundColor: project.color }} />
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMobileBack}
            className="md:hidden p-2 -ml-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
            {project.name}
          </h2>
        </div>
        <div ref={pickerRef} className="relative flex-shrink-0 hidden md:block">
          <button
            onClick={() => setPickerOpen(v => !v)}
            title="New note"
            className={cn(
              'p-1 rounded-md transition-colors',
              pickerOpen
                ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            <Plus size={16} className={cn('transition-transform duration-200', pickerOpen && 'rotate-45')} />
          </button>
          {pickerOpen && (
            <div className="absolute top-full right-0 mt-2 flex flex-col gap-0.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-lg p-1.5 w-36 z-40">
              {NOTE_TYPE_OPTIONS.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => { onCreateNote(type); setPickerOpen(false) }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <Icon size={14} className="text-[var(--color-accent)] flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-[var(--color-text-muted)]">Loading…</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-[var(--color-text-muted)]">No notes yet</p>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Pinned
                </p>
                {pinnedNotes.map(note => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={note.id === activeNoteId}
                    projectColor={project.color}
                    onSelect={onSelectNote}
                    onArchive={onArchiveNote}
                    onPin={onPinNote}
                    onUnpin={onUnpinNote}
                  />
                ))}
              </div>
            )}

            {/* Unpinned / draggable section */}
            {unpinnedNotes.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={unpinnedNotes.map(n => n.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unpinnedNotes.map(note => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      isActive={note.id === activeNoteId}
                      projectColor={project.color}
                      onSelect={onSelectNote}
                      onArchive={onArchiveNote}
                      onPin={onPinNote}
                      onUnpin={onUnpinNote}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <div ref={mobilePickerRef} className="md:hidden">
        {pickerOpen && (
          <div
            className="absolute right-5 flex flex-col gap-0.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-lg p-1.5 w-44 z-30"
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
          >
            {NOTE_TYPE_OPTIONS.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => { onCreateNote(type); setPickerOpen(false) }}
                className="flex items-center gap-2.5 w-full px-2.5 py-3 rounded-lg text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <Icon size={16} className="text-[var(--color-accent)] flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setPickerOpen(v => !v)}
          aria-label="New note"
          className="absolute right-5 w-14 h-14 rounded-full bg-[var(--color-accent)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-accent-hover)] active:scale-95 transition-all z-30"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
        >
          <Plus size={26} className={cn('transition-transform duration-200', pickerOpen && 'rotate-45')} />
        </button>
      </div>
    </div>
  )
}
