'use client'

import { useRef, useState } from 'react'
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

const REVEAL_PX = 88
const SWIPE_THRESHOLD = 40
const DIRECTION_THRESHOLD = 8

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
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [animating, setAnimating] = useState(true)
  const startX = useRef(0)
  const startY = useRef(0)
  const initialOffset = useRef(0)
  const direction = useRef<'horizontal' | 'vertical' | null>(null)

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
  }

  const date = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const isRevealed = swipeOffset <= -REVEAL_PX + 1

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation()
    onArchive(note.id)
  }

  function handlePin(e: React.MouseEvent) {
    e.stopPropagation()
    if (note.pinned) onUnpin(note.id)
    else onPin(note.id)
  }

  function handleRowClick() {
    if (isRevealed || swipeOffset < 0) {
      setAnimating(true)
      setSwipeOffset(0)
      return
    }
    onSelect(note.id)
  }

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    initialOffset.current = swipeOffset
    direction.current = null
    setAnimating(false)
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (direction.current === null) {
      if (Math.abs(dx) > DIRECTION_THRESHOLD || Math.abs(dy) > DIRECTION_THRESHOLD) {
        direction.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
      }
    }

    if (direction.current === 'horizontal') {
      const next = Math.min(0, Math.max(-REVEAL_PX, initialOffset.current + dx))
      setSwipeOffset(next)
    }
  }

  function handleTouchEnd() {
    setAnimating(true)
    if (direction.current === 'horizontal') {
      setSwipeOffset(swipeOffset < -SWIPE_THRESHOLD ? -REVEAL_PX : 0)
    }
    direction.current = null
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative overflow-hidden border-b border-[var(--color-border)]',
        isDragging && 'opacity-40'
      )}
    >
      {/* Archive action revealed on swipe-left (mobile) */}
      <button
        onClick={handleArchive}
        aria-label="Archive note"
        className="md:hidden absolute right-0 top-0 bottom-0 w-[88px] flex items-center justify-center bg-red-500 text-white"
        style={{ opacity: swipeOffset < 0 ? 1 : 0, pointerEvents: swipeOffset < 0 ? 'auto' : 'none' }}
      >
        <Archive size={20} />
      </button>

      {/* Row content */}
      <div
        {...attributes}
        {...listeners}
        onClick={handleRowClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="group flex items-center gap-2 px-4 py-1.5 cursor-pointer select-none"
        style={{
          backgroundColor: bgColor ?? '#e8e8e8',
          transform: `translate3d(${swipeOffset}px, 0, 0)`,
          transition: animating ? 'transform 200ms ease-out' : 'none',
        }}
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
            className="hidden md:flex items-center gap-1 text-xs px-1 py-1 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-500"
          >
            <Archive size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
