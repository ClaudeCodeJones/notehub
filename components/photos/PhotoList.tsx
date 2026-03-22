'use client'

import { useRef } from 'react'
import { ImageIcon, ImagePlus, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Photo } from '@/hooks/usePhotos'
import { PHOTOS_LIMIT } from '@/hooks/usePhotos'

interface PhotoListProps {
  photos: Photo[]
  loading: boolean
  uploading: boolean
  selectedPhoto: Photo | null
  onSelectPhoto: (photo: Photo) => void
  onUpload: (files: FileList) => Promise<void>
  onArchive: (name: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PhotoList({ photos, loading, uploading, selectedPhoto, onSelectPhoto, onUpload, onArchive, onDelete }: PhotoListProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const atLimit = photos.length >= PHOTOS_LIMIT

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col w-[280px] flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] h-full">
      {/* Header */}
      <div className="px-4 h-[88px] border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Photos</h2>
          <span className={cn('text-xs', atLimit ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]')}>
            {photos.length} / {PHOTOS_LIMIT}
          </span>
          {uploading && (
            <span className="text-xs text-[var(--color-text-muted)]">Uploading…</span>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || atLimit}
          title={atLimit ? 'Limit reached' : 'Upload photos'}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ImagePlus size={16} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <p className="text-xs text-[var(--color-text-muted)] px-4 py-4">Loading…</p>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-4">
            <ImageIcon size={32} className="text-[var(--color-text-muted)]" style={{ opacity: 0.3 }} />
            <p className="text-xs text-[var(--color-text-muted)] text-center">No photos yet</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Upload one
            </button>
          </div>
        ) : (
          <div className="py-1">
            {photos.map(photo => {
              const isActive = selectedPhoto?.name === photo.name
              return (
                <div
                  key={photo.name}
                  onClick={() => onSelectPhoto(photo)}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors relative',
                    isActive
                      ? 'bg-[var(--color-bg-secondary)]'
                      : 'hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-accent)] rounded-r" />
                  )}
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] truncate leading-tight">
                      {photo.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {formatDate(photo.created_at)}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 transition-all">
                    <button
                      onClick={e => { e.stopPropagation(); onArchive(photo.name) }}
                      title="Archive"
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(photo.name) }}
                      title="Permanently delete"
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
