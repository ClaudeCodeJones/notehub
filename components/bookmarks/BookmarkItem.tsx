'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types'

interface BookmarkItemProps {
  bookmark: Bookmark
  isActive: boolean
  onSelect: (id: string) => void
}

export function BookmarkItem({ bookmark, isActive, onSelect }: BookmarkItemProps) {
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
        'px-4 py-3 border-b border-[var(--color-border)] cursor-pointer select-none transition-colors',
        isActive
          ? 'bg-[var(--color-bg-primary)]'
          : 'hover:bg-[var(--color-bg-tertiary)]',
        isDragging && 'opacity-40'
      )}
    >
      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
        {bookmark.title || bookmark.url}
      </p>
      {bookmark.domain && (
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{bookmark.domain}</p>
      )}
    </div>
  )
}
