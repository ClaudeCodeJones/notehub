'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteItemProps {
  note: Note
  isActive: boolean
  onSelect: (id: string) => void
}

export function NoteItem({ note, isActive, onSelect }: NoteItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const date = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  // Strip HTML tags for preview
  const preview = note.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(note.id)}
      className={cn(
        'px-4 py-3 border-b border-[var(--color-border)] cursor-pointer select-none transition-colors',
        isActive
          ? 'bg-[var(--color-bg-primary)]'
          : 'hover:bg-[var(--color-bg-tertiary)]',
        isDragging && 'opacity-40'
      )}
    >
      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
        {note.title || 'Untitled'}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{date}</span>
        {preview && (
          <span className="text-xs text-[var(--color-text-muted)] truncate">{preview}</span>
        )}
      </div>
    </div>
  )
}
