'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { FolderOpen, Vault, Bookmark, Image as ImageIcon, Search, Plus, FolderPlus, BookmarkPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, VaultItem, BookmarkCollection } from '@/types'
import type { RecentEntry } from '@/hooks/useRecents'

// Very subtle per-card tint colours — rgba overlays on bg-secondary, using the established PROJECT_COLORS palette.
const CARD_TINTS = {
  projects:  'rgba(45, 90, 39, 0.07)',    // accent green
  vault:     'rgba(136, 135, 128, 0.09)', // gray  (#888780)
  bookmarks: 'rgba(55, 138, 221, 0.07)',  // blue  (#378ADD)
  photos:    'rgba(127, 119, 221, 0.07)', // purple (#7F77DD)
} as const

// ─── Resolved recent type ─────────────────────────────────────────────────────

type ResolvedRecent =
  | ({ type: 'project' } & Project)
  | ({ type: 'vault' } & VaultItem)
  | ({ type: 'collection' } & BookmarkCollection)

// ─── Nav Card (Tool Tile) ─────────────────────────────────────────────────────

interface NavCardProps {
  icon: React.ElementType
  label: string
  sub: string
  count?: number
  onClick: () => void
  disabled?: boolean
  tint: string
}

function NavCard({ icon: Icon, label, sub, count, onClick, disabled, tint }: NavCardProps) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        'relative rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden shadow-sm transition-all duration-150 min-h-[160px] md:min-h-[320px]',
        disabled
          ? 'opacity-40 cursor-default'
          : 'cursor-pointer hover:scale-[1.02] hover:shadow-md'
      )}
    >
      {/* Subtle per-card colour tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: tint }} />

      {/* Content */}
      <div className="relative p-6 flex flex-col gap-4">
        {/* Icon in a light container for app-tile presence */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <Icon size={20} className="text-[var(--color-accent)]" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] tracking-tight leading-tight">{label}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">{sub}</p>
          {count != null && (
            <p className="text-[11px] text-[var(--color-text-muted)] mt-2" style={{ opacity: 0.6 }}>
              {count} {count !== 1 ? 'items' : 'item'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Recent Card ──────────────────────────────────────────────────────────────

function RecentCard({ item, onClick }: { item: ResolvedRecent; onClick: () => void }) {
  const Icon = item.type === 'project' ? FolderOpen : item.type === 'vault' ? Vault : Bookmark

  return (
    <div
      onClick={onClick}
      className="min-w-0 md:flex-1 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 cursor-pointer shadow-sm hover:shadow hover:-translate-y-px transition-all duration-150 flex flex-col gap-2"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: item.color + '30' }}
      >
        <Icon size={15} style={{ color: item.color }} />
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate leading-snug">{item.name}</p>
      <p className="text-[11px] text-[var(--color-text-secondary)] capitalize">{item.type === 'collection' ? 'Bookmark' : item.type}</p>
    </div>
  )
}

// ─── FAB ──────────────────────────────────────────────────────────────────────

function FABRow({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors duration-150"
    >
      <Icon size={15} className="text-[var(--color-accent)] flex-shrink-0" />
      {label}
    </button>
  )
}

function FAB({ onCreateProject, onCreateCollection, onCreateVaultItem }: {
  onCreateProject: () => void
  onCreateCollection: () => void
  onCreateVaultItem: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handle(fn: () => void) { setOpen(false); fn() }

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
        title="Create new"
      >
        <Plus size={18} className={cn('transition-transform duration-200', open && 'rotate-45')} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 flex flex-col gap-0.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-2xl shadow-lg p-2 w-48 z-40">
          <FABRow icon={FolderPlus} label="New Project" onClick={() => handle(onCreateProject)} />
          <FABRow icon={BookmarkPlus} label="New Collection" onClick={() => handle(onCreateCollection)} />
          <FABRow icon={Vault} label="Add to Vault" onClick={() => handle(onCreateVaultItem)} />
        </div>
      )}
    </div>
  )
}

// ─── HomePanel ────────────────────────────────────────────────────────────────

interface HomePanelProps {
  projects: Project[]
  vaultItems: VaultItem[]
  collections: BookmarkCollection[]
  recents: RecentEntry[]
  onSelectProject: (id: string) => void
  onSelectCollection: (id: string) => void
  onSelectVaultItem: (id: string) => void
  onOpenPhotos: () => void
  onOpenSearch: () => void
  onCreateProject: () => void
  onCreateCollection: () => void
  onCreateVaultItem: () => void
}

export function HomePanel({
  projects,
  vaultItems,
  collections,
  recents,
  onSelectProject,
  onSelectCollection,
  onSelectVaultItem,
  onOpenPhotos,
  onOpenSearch,
  onCreateProject,
  onCreateCollection,
  onCreateVaultItem,
}: HomePanelProps) {
  const resolvedRecents: ResolvedRecent[] = recents.flatMap((r): ResolvedRecent[] => {
    if (r.type === 'project') {
      const p = projects.find(x => x.id === r.id)
      return p ? [{ ...p, type: 'project' as const }] : []
    }
    if (r.type === 'vault') {
      const v = vaultItems.find(x => x.id === r.id)
      return v ? [{ ...v, type: 'vault' as const }] : []
    }
    const c = collections.find(x => x.id === r.id)
    return c ? [{ ...c, type: 'collection' as const }] : []
  })

  function handleItemClick(item: ResolvedRecent) {
    if (item.type === 'project') onSelectProject(item.id)
    else if (item.type === 'vault') onSelectVaultItem(item.id)
    else onSelectCollection(item.id)
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)] h-full overflow-hidden">

      {/* Header */}
      <div className="h-24 flex items-center flex-shrink-0 bg-[var(--color-accent)] shadow-sm">
        <div className="max-w-4xl mx-auto px-6 w-full flex items-center justify-between">
          <Image
            src="/notehub_logo_white.png"
            alt="NoteHUB"
            width={260}
            height={88}
            quality={100}
            className="h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-1">
            <FAB
              onCreateProject={onCreateProject}
              onCreateCollection={onCreateCollection}
              onCreateVaultItem={onCreateVaultItem}
            />
            <button
              onClick={onOpenSearch}
              title="Search"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable body — max-width centred to reduce empty space on wide screens */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-6 flex flex-col gap-5">

          {/* Tool tiles */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NavCard
                icon={FolderOpen}
                label="Projects"
                sub="Notes & docs"
                count={projects.length}
                tint={CARD_TINTS.projects}
                onClick={() => projects[0] && onSelectProject(projects[0].id)}
                disabled={projects.length === 0}
              />
              <NavCard
                icon={Vault}
                label="Vault"
                sub="Private files"
                count={vaultItems.length}
                tint={CARD_TINTS.vault}
                onClick={() => vaultItems[0] && onSelectVaultItem(vaultItems[0].id)}
                disabled={vaultItems.length === 0}
              />
              <NavCard
                icon={Bookmark}
                label="Bookmarks"
                sub="Saved links"
                count={collections.length}
                tint={CARD_TINTS.bookmarks}
                onClick={() => collections[0] && onSelectCollection(collections[0].id)}
                disabled={collections.length === 0}
              />
              <NavCard
                icon={ImageIcon}
                label="Photos"
                sub="Uploads"
                tint={CARD_TINTS.photos}
                onClick={onOpenPhotos}
              />
            </div>
          </section>

          {/* Recent strip */}
          {resolvedRecents.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">Recent</h2>
              <div className="grid grid-cols-2 gap-3 md:flex md:flex-row">
                {resolvedRecents.slice(0, 4).map(item => (
                  <RecentCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
                ))}
              </div>
            </section>
          )}


        </div>
      </div>

    </div>
  )
}
