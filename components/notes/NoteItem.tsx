'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

interface NoteItemProps {
  note: Note
  isActive: boolean
  projectColor: string
  onSelect: (id: string) => void
  onDelete: (id: string) => Promise<void>
}

export function NoteItem({ note, isActive, projectColor, onSelect, onDelete }: NoteItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
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

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(note.id)
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
        'group flex items-center gap-2 px-4 py-4 border-b border-[var(--color-border)] cursor-pointer select-none transition-colors',
        isDragging && 'opacity-40'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {note.title || 'Untitled'}
        </p>
        <span className="text-xs text-[var(--color-text-muted)]">{date}</span>
      </div>

      <button
        onClick={handleDelete}
        onPointerDown={e => e.stopPropagation()}
        onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
        className={cn(
          'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors flex-shrink-0',
          confirmDelete
            ? 'bg-red-500 text-white'
            : 'text-[var(--color-text-muted)] hover:text-red-500',
          !confirmDelete && 'opacity-0 group-hover:opacity-100',
        )}
      >
        <Trash2 size={11} />
        {confirmDelete && 'Sure?'}
      </button>
    </div>
  )
}
