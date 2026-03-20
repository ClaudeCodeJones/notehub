'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookmarkCollection } from '@/types'

interface CollectionItemProps {
  collection: BookmarkCollection
  isActive: boolean
  onSelect: (id: string) => void
}

export function CollectionItem({ collection, isActive, onSelect }: CollectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collection.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const iconStyle = { color: collection.color, fill: collection.color }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(collection.id)}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer select-none transition-colors',
        isActive
          ? 'bg-[var(--color-bg-tertiary)]'
          : 'hover:bg-[var(--color-bg-secondary)]',
        isDragging && 'opacity-40 shadow-lg'
      )}
    >
      <Bookmark size={13} className="flex-shrink-0" style={iconStyle} />
      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
        {collection.name}
      </span>
    </div>
  )
}
