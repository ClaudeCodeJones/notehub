'use client'

import { useRef, useEffect } from 'react'
import { Search, FileText, Bookmark, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteResult, BookmarkResult } from '@/hooks/useSearch'

interface SearchPanelProps {
  query: string
  onQueryChange: (q: string) => void
  noteResults: NoteResult[]
  bookmarkResults: BookmarkResult[]
  loading: boolean
  onSelectNote: (note: NoteResult) => void
  onSelectBookmark: (bookmark: BookmarkResult) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function SearchPanel({
  query,
  onQueryChange,
  noteResults,
  bookmarkResults,
  loading,
  onSelectNote,
  onSelectBookmark,
}: SearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const hasResults = noteResults.length > 0 || bookmarkResults.length > 0
  const showEmpty = query.trim() && !loading && !hasResults

  return (
    <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] h-full">
      {/* Header / search input */}
      <div className="px-4 h-[88px] border-b border-[var(--color-border)] flex items-center gap-2 flex-shrink-0">
        <Search size={15} className="text-[var(--color-text-muted)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search notes and bookmarks…"
          className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!query.trim() ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-[var(--color-text-muted)]">Start typing to search</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-[var(--color-text-muted)]">Searching…</p>
          </div>
        ) : showEmpty ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-[var(--color-text-muted)]">No results for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <>
            {noteResults.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Notes
                </p>
                {noteResults.map(note => (
                  <button
                    key={note.id}
                    onClick={() => onSelectNote(note)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]',
                      'text-left hover:bg-[var(--color-bg-secondary)] transition-colors'
                    )}
                  >
                    <FileText size={14} className="text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] truncate">
                        {note.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{formatDate(note.updated_at)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {bookmarkResults.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Bookmarks
                </p>
                {bookmarkResults.map(bookmark => (
                  <button
                    key={bookmark.id}
                    onClick={() => onSelectBookmark(bookmark)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 border-b border-[var(--color-border)]',
                      'text-left hover:bg-[var(--color-bg-secondary)] transition-colors'
                    )}
                  >
                    <Bookmark size={14} className="text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] truncate">
                        {bookmark.title || bookmark.url}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {bookmark.domain ?? bookmark.url}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
