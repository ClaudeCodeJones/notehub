'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types'

interface BookmarkItemProps {
  bookmark: Bookmark
  isActive: boolean
  onSelect: (id: string) => void
  onArchive: (id: string) => Promise<void>
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
}

export function BookmarkItem({ bookmark, isActive, onSelect, onArchive }: BookmarkItemProps) {
  const title = bookmark.title ? decodeEntities(bookmark.title) : null
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bookmark.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(bookmark.id)}
      className={cn(
        'group relative px-4 py-3 border-b border-[var(--color-border)] cursor-pointer select-none transition-colors',
        isActive ? 'bg-[var(--color-bg-primary)]' : 'hover:bg-[var(--color-bg-tertiary)]',
        isDragging && 'opacity-40'
      )}
    >
      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate pr-6">
        {title || bookmark.url}
      </p>
      {bookmark.domain && (
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{bookmark.domain}</p>
      )}
      <button
        onClick={e => { e.stopPropagation(); onArchive(bookmark.id) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <Archive size={12} />
      </button>
    </div>
  )
}
