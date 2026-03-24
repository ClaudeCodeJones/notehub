'use client'

import { useState, useRef, useEffect } from 'react'
import { ExternalLink, Globe, Archive, ChevronLeft, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types'

interface BookmarkDetailProps {
  bookmark: Bookmark
  onArchive: (id: string) => Promise<void>
  onRename: (title: string) => void
  onMobileBack?: () => void
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
}

export function BookmarkDetail({ bookmark, onArchive, onRename, onMobileBack }: BookmarkDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const title = bookmark.title ? decodeEntities(bookmark.title) : null

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus()
  }, [isEditingTitle])

  function startEditingTitle() {
    setEditTitle(title ?? bookmark.url)
    setIsEditingTitle(true)
  }

  function commitTitle() {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== title) onRename(trimmed)
    setIsEditingTitle(false)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); commitTitle() }
    if (e.key === 'Escape') setIsEditingTitle(false)
  }

  const date = new Date(bookmark.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await onArchive(bookmark.id)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)] h-full overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={onMobileBack}
          className="p-1 -ml-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors flex-shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {title || bookmark.url}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0">
        {/* Title */}
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleTitleKeyDown}
            className="w-full text-lg font-semibold leading-snug bg-transparent outline-none border-b border-[var(--color-accent)] text-[var(--color-text-primary)] mb-6 pb-1"
          />
        ) : (
          <div className="group flex items-start gap-2 mb-6">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <h1 className="text-lg font-semibold leading-snug text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors break-words">
                {title || bookmark.url}
              </h1>
            </a>
            <button
              onClick={startEditingTitle}
              title="Rename"
              className="opacity-0 group-hover:opacity-100 mt-1 p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all flex-shrink-0"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-4">
          {/* Full URL */}
          <div className="flex items-start gap-3">
            <ExternalLink
              size={14}
              className="mt-0.5 flex-shrink-0 text-[var(--color-text-muted)]"
            />
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] break-all transition-colors"
            >
              {bookmark.url}
            </a>
          </div>

          {/* Domain */}
          {bookmark.domain && (
            <div className="flex items-center gap-3">
              <Globe size={14} className="flex-shrink-0 text-[var(--color-text-muted)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {bookmark.domain}
              </span>
            </div>
          )}

          {/* Date saved */}
          <p className="text-sm text-[var(--color-text-muted)]">Saved {date}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-3 border-t border-[var(--color-border)] flex items-center justify-end flex-shrink-0">
        <button
          onClick={handleDelete}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors',
            confirmDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50'
          )}
        >
          <Archive size={12} />
          {confirmDelete ? 'Are you sure?' : 'Archive'}
        </button>
      </div>
    </div>
  )
}
