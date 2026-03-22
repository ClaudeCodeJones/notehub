'use client'

import { ImageIcon, ExternalLink } from 'lucide-react'
import type { Photo } from '@/hooks/usePhotos'

interface PhotoViewerProps {
  photo: Photo | null
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function PhotoViewer({ photo }: PhotoViewerProps) {
  if (!photo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] select-none gap-3">
        <ImageIcon size={48} className="text-[var(--color-text-muted)]" style={{ opacity: 0.2 }} />
        <p className="text-sm text-[var(--color-text-muted)]">Select a photo</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)] h-full overflow-hidden">
      {/* Header spacer to match other panels */}
      <div className="h-[88px] border-b border-[var(--color-border)] flex items-center px-8 flex-shrink-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate flex-1">{photo.name}</p>
        <a
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors flex-shrink-0"
        >
          <ExternalLink size={14} />
          Open full size
        </a>
      </div>

      {/* Photo */}
      <div className="flex-1 flex items-center justify-center p-8 min-h-0">
        <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full max-h-[60vh] object-contain rounded-lg"
          />
          <p className="text-xs text-[var(--color-text-muted)]">{formatDate(photo.created_at)}</p>
        </div>
      </div>
    </div>
  )
}
