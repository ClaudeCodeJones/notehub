'use client'

import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { cn } from '@/lib/utils'
import type { Photo } from '@/hooks/usePhotos'

interface PhotosPanelProps {
  photos: Photo[]
  loading: boolean
  uploading: boolean
  onUpload: (files: FileList) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onClose: () => void
}

export function PhotosPanel({ photos, loading, uploading, onUpload, onDelete, onClose }: PhotosPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)] h-full overflow-hidden">
      <AppHeader>
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            Upload
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </AppHeader>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <ImageIcon size={36} className="text-[var(--color-text-muted)]" style={{ opacity: 0.3 }} />
            <p className="text-sm text-[var(--color-text-muted)]">No photos yet</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Upload one
            </button>
          </div>
        ) : (
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {photos.map(photo => (
              <div
                key={photo.name}
                className="relative aspect-square group"
                onMouseEnter={() => setHoveredName(photo.name)}
                onMouseLeave={() => setHoveredName(null)}
              >
                <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </a>
                <button
                  onClick={() => onDelete(photo.name)}
                  className={cn(
                    'absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white transition-opacity',
                    hoveredName === photo.name ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
