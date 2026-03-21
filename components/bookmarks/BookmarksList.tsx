'use client'

import { useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Bookmark, ChevronLeft } from 'lucide-react'
import { BookmarkItem } from './BookmarkItem'
import type { Bookmark as BookmarkType, BookmarkCollection } from '@/types'

interface BookmarksListProps {
  collection: BookmarkCollection | null
  bookmarks: BookmarkType[]
  activeBookmarkId: string | null
  loading: boolean
  onSelectBookmark: (id: string) => void
  onCreateBookmark: (url: string) => Promise<BookmarkType | null>
  onReorderBookmarks: (bookmarks: BookmarkType[]) => void
  onMobileBack?: () => void
}

export function BookmarksList({
  collection,
  bookmarks,
  activeBookmarkId,
  loading,
  onSelectBookmark,
  onCreateBookmark,
  onReorderBookmarks,
  onMobileBack,
}: BookmarksListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const isSubmittingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = bookmarks.findIndex(b => b.id === active.id)
    const newIndex = bookmarks.findIndex(b => b.id === over.id)
    onReorderBookmarks(arrayMove(bookmarks, oldIndex, newIndex))
  }

  async function handleSubmit() {
    if (isSubmittingRef.current) return
    const url = newUrl.trim()
    setNewUrl('')
    setIsAdding(false)
    if (!url) return
    // basic URL validation — accept bare domains too (createBookmark normalises them)
    isSubmittingRef.current = true
    const bookmark = await onCreateBookmark(url)
    isSubmittingRef.current = false
    if (bookmark) onSelectBookmark(bookmark.id)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setNewUrl('')
      setIsAdding(false)
    }
  }

  function startAdding() {
    setIsAdding(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  if (!collection) {
    return (
      <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col items-center justify-center border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full gap-2">
        <Bookmark size={28} className="text-[var(--color-text-muted)]" style={{ opacity: 0.4 }} />
        <p className="text-xs text-[var(--color-text-muted)]">Select a collection</p>
      </div>
    )
  }

  return (
    <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full">
      {/* Header */}
      <div className="relative px-4 h-[88px] border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-sm" style={{ backgroundColor: collection.color }} />
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMobileBack}
            className="md:hidden p-1 -ml-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
            {collection.name}
          </h2>
        </div>
        <button
          onClick={startAdding}
          title="Add bookmark"
          className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Bookmarks */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isAdding && (
          <div className="px-3 py-3 border-b border-[var(--color-border)]">
            <input
              ref={inputRef}
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSubmit}
              placeholder="Paste a URL…"
              className="w-full text-sm bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none ring-2 ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-[var(--color-text-muted)]">Loading…</p>
          </div>
        ) : bookmarks.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-[var(--color-text-muted)]">No bookmarks yet</p>
            <button
              onClick={startAdding}
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Add one
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={bookmarks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {bookmarks.map(bookmark => (
                <BookmarkItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  isActive={bookmark.id === activeBookmarkId}
                  onSelect={onSelectBookmark}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
