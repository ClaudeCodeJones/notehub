'use client'

import { useState } from 'react'
import { ExternalLink, Globe, Trash2, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types'

interface BookmarkDetailProps {
  bookmark: Bookmark
  onDelete: (id: string) => Promise<void>
  onMobileBack?: () => void
}

export function BookmarkDetail({ bookmark, onDelete, onMobileBack }: BookmarkDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

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
    await onDelete(bookmark.id)
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
          {bookmark.title || bookmark.url}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 min-h-0">
        {/* Title — clicks open the URL */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block mb-6"
        >
          <h1 className="text-[1.75rem] font-bold leading-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors break-words">
            {bookmark.title || bookmark.url}
          </h1>
        </a>

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
          <Trash2 size={12} />
          {confirmDelete ? 'Are you sure?' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
