'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Archive, Pin, CheckSquare, FileText, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

const TYPE_ICON = {
  checkbox: CheckSquare,
  note: FileText,
  text: AlignLeft,
} as const

interface NoteItemProps {
  note: Note
  isActive: boolean
  projectColor: string
  onSelect: (id: string) => void
  onArchive: (id: string) => Promise<void>
  onPin: (id: string) => Promise<void>
  onUnpin: (id: string) => Promise<void>
}

export function NoteItem({ note, isActive, projectColor, onSelect, onArchive, onPin, onUnpin }: NoteItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
  })

  const bgColor = isActive
    ? `${projectColor}33`
    : isHovered
    ? `${projectColor}14`
    : undefined

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: bgColor,
  }

  const date = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation()
    onArchive(note.id)
  }

  function handlePin(e: React.MouseEvent) {
    e.stopPropagation()
    note.pinned ? onUnpin(note.id) : onPin(note.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group flex items-center gap-2 px-4 py-1.5 border-b border-[var(--color-border)] cursor-pointer select-none transition-colors',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {(() => { const Icon = TYPE_ICON[note.note_type]; return <Icon size={11} className="flex-shrink-0 text-[var(--color-text-muted)]" style={{ opacity: 0.6 }} /> })()}
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {note.title || 'Untitled'}
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">{date}</span>
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={handlePin}
          onPointerDown={e => e.stopPropagation()}
          title={note.pinned ? 'Unpin' : 'Pin'}
          className={cn(
            'p-1 rounded transition-colors',
            note.pinned
              ? 'opacity-100 text-[var(--color-accent)]'
              : 'opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]'
          )}
        >
          <Pin size={13} className={note.pinned ? 'fill-current' : ''} />
        </button>
        <button
          onClick={handleArchive}
          onPointerDown={e => e.stopPropagation()}
          className="flex items-center gap-1 text-xs px-1 py-1 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-500"
        >
          <Archive size={13} />
        </button>
      </div>
    </div>
  )
}
