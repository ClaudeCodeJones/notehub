'use client'

import { useEffect, useState } from 'react'
import { Archive, FileText, Bookmark, RotateCcw, Trash2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useArchivedItems } from '@/hooks/useArchivedItems'
import type { Note, Bookmark as BookmarkType } from '@/types'
import type { Photo } from '@/hooks/usePhotos'

type Tab = 'notes' | 'bookmarks' | 'photos'

interface ArchivePanelProps {
  onClose: () => void
  archivedPhotos: Photo[]
  onRestorePhoto: (name: string) => Promise<void>
  onDeletePhoto: (name: string) => Promise<void>
}

export function ArchivePanel({ onClose, archivedPhotos, onRestorePhoto, onDeletePhoto }: ArchivePanelProps) {
  const [tab, setTab] = useState<Tab>('notes')
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const {
    archivedNotes,
    archivedBookmarks,
    loading,
    fetchArchived,
    restoreNote,
    permanentDeleteNote,
    restoreBookmark,
    permanentDeleteBookmark,
  } = useArchivedItems()

  useEffect(() => {
    fetchArchived()
  }, [fetchArchived])

  const showDeleteAll =
    (tab === 'notes' && archivedNotes.length > 0) ||
    (tab === 'bookmarks' && archivedBookmarks.length > 0) ||
    (tab === 'photos' && archivedPhotos.length > 0)

  return (
    <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full">
      {/* Header */}
      <div className="px-4 h-[88px] border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-[var(--color-text-muted)]" />
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Archive</h2>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={() => setTab('notes')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
            tab === 'notes'
              ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <FileText size={12} />
          Notes {archivedNotes.length > 0 && `(${archivedNotes.length})`}
        </button>
        <button
          onClick={() => setTab('bookmarks')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
            tab === 'bookmarks'
              ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <Bookmark size={12} />
          Bookmarks {archivedBookmarks.length > 0 && `(${archivedBookmarks.length})`}
        </button>
        <button
          onClick={() => setTab('photos')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
            tab === 'photos'
              ? 'text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <ImageIcon size={12} />
          Photos {archivedPhotos.length > 0 && `(${archivedPhotos.length})`}
        </button>
      </div>

      {/* Delete all footer */}
      {showDeleteAll && (
        <div className="px-4 py-2 border-b border-[var(--color-border)] flex justify-end flex-shrink-0">
          <button
            onClick={async () => {
              if (!confirmDeleteAll) { setConfirmDeleteAll(true); return }
              setConfirmDeleteAll(false)
              if (tab === 'notes') {
                await Promise.all(archivedNotes.map(n => permanentDeleteNote(n.id)))
              } else if (tab === 'bookmarks') {
                await Promise.all(archivedBookmarks.map(b => permanentDeleteBookmark(b.id)))
              } else {
                await Promise.all(archivedPhotos.map(p => onDeletePhoto(p.name)))
              }
            }}
            onBlur={() => setTimeout(() => setConfirmDeleteAll(false), 150)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-colors',
              confirmDeleteAll ? 'bg-red-500 text-white' : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            <Trash2 size={12} />
            {confirmDeleteAll ? 'Sure? Delete all' : 'Delete all'}
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && tab !== 'photos' ? (
          <div className="flex items-center justify-center h-16">
            <p className="text-xs text-[var(--color-text-muted)]">Loading…</p>
          </div>
        ) : tab === 'notes' ? (
          archivedNotes.length === 0 ? (
            <EmptyState label="No archived notes" />
          ) : (
            archivedNotes.map(note => (
              <ArchivedNoteRow
                key={note.id}
                note={note}
                onRestore={restoreNote}
                onDelete={permanentDeleteNote}
              />
            ))
          )
        ) : tab === 'bookmarks' ? (
          archivedBookmarks.length === 0 ? (
            <EmptyState label="No archived bookmarks" />
          ) : (
            archivedBookmarks.map(bookmark => (
              <ArchivedBookmarkRow
                key={bookmark.id}
                bookmark={bookmark}
                onRestore={restoreBookmark}
                onDelete={permanentDeleteBookmark}
              />
            ))
          )
        ) : (
          archivedPhotos.length === 0 ? (
            <EmptyState label="No archived photos" />
          ) : (
            archivedPhotos.map(photo => (
              <ArchivedPhotoRow
                key={photo.name}
                photo={photo}
                onRestore={onRestorePhoto}
                onDelete={onDeletePhoto}
              />
            ))
          )
        )}
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-32">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  )
}

function ArchivedNoteRow({
  note,
  onRestore,
  onDelete,
}: {
  note: Note
  onRestore: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const date = note.archived_at
    ? new Date(note.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {note.title || 'Untitled'}
        </p>
        <span className="text-xs text-[var(--color-text-muted)]">Archived {date}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onRestore(note.id)}
          title="Restore"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => {
            if (!confirmDelete) { setConfirmDelete(true); return }
            onDelete(note.id)
          }}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
          className={cn(
            'flex items-center gap-1 text-xs px-1.5 py-1 rounded transition-colors',
            confirmDelete ? 'bg-red-500 text-white' : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-[var(--color-bg-tertiary)]'
          )}
        >
          <Trash2 size={12} />
          {confirmDelete && 'Sure?'}
        </button>
      </div>
    </div>
  )
}

function ArchivedBookmarkRow({
  bookmark,
  onRestore,
  onDelete,
}: {
  bookmark: BookmarkType
  onRestore: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const date = bookmark.archived_at
    ? new Date(bookmark.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {bookmark.title || bookmark.url}
        </p>
        <span className="text-xs text-[var(--color-text-muted)]">{bookmark.domain ?? bookmark.url} · Archived {date}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onRestore(bookmark.id)}
          title="Restore"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => {
            if (!confirmDelete) { setConfirmDelete(true); return }
            onDelete(bookmark.id)
          }}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
          className={cn(
            'flex items-center gap-1 text-xs px-1.5 py-1 rounded transition-colors',
            confirmDelete ? 'bg-red-500 text-white' : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-[var(--color-bg-tertiary)]'
          )}
        >
          <Trash2 size={12} />
          {confirmDelete && 'Sure?'}
        </button>
      </div>
    </div>
  )
}

function ArchivedPhotoRow({
  photo,
  onRestore,
  onDelete,
}: {
  photo: Photo
  onRestore: (name: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const date = photo.created_at
    ? new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.name} className="w-9 h-9 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{photo.name}</p>
        <span className="text-xs text-[var(--color-text-muted)]">{date}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onRestore(photo.name)}
          title="Restore"
          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <RotateCcw size={13} />
        </button>
        <button
          onClick={() => {
            if (!confirmDelete) { setConfirmDelete(true); return }
            onDelete(photo.name)
          }}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
          className={cn(
            'flex items-center gap-1 text-xs px-1.5 py-1 rounded transition-colors',
            confirmDelete ? 'bg-red-500 text-white' : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-[var(--color-bg-tertiary)]'
          )}
        >
          <Trash2 size={12} />
          {confirmDelete && 'Sure?'}
        </button>
      </div>
    </div>
  )
}
