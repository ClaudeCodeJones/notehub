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
import Image from 'next/image'
import { Plus, FolderOpen, Bookmark, Archive, Vault } from 'lucide-react'
import { ProjectItem } from './ProjectItem'
import { CollectionItem } from './CollectionItem'
import { VaultItem } from './VaultItem'
import { cn } from '@/lib/utils'
import type { Project, BookmarkCollection, VaultItem as VaultItemType } from '@/types'
import type { RecentEntry } from '@/hooks/useRecents'

interface ProjectsSidebarProps {
  projects: Project[]
  activeProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: (name: string) => Promise<Project | null>
  onReorderProjects: (projects: Project[]) => void
  onUpdateProject: (id: string, color: string) => void
  onRenameProject: (id: string, name: string) => void
  collections: BookmarkCollection[]
  activeCollectionId: string | null
  onSelectCollection: (id: string) => void
  onCreateCollection: (name: string) => Promise<BookmarkCollection | null>
  onReorderCollections: (collections: BookmarkCollection[]) => void
  onUpdateCollection: (id: string, color: string) => void
  vaultItems: VaultItemType[]
  activeVaultItemId: string | null
  onSelectVaultItem: (id: string) => void
  onCreateVaultItem: (name: string) => Promise<VaultItemType | null>
  onReorderVaultItems: (items: VaultItemType[]) => void
  onUpdateVaultItem: (id: string, color: string) => void
  onRenameVaultItem: (id: string, name: string) => void
  recents: RecentEntry[]
  onOpenArchive: () => void
  archiveMode: boolean
}

export function ProjectsSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onReorderProjects,
  onUpdateProject,
  onRenameProject,
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onReorderCollections,
  onUpdateCollection,
  vaultItems,
  activeVaultItemId,
  onSelectVaultItem,
  onCreateVaultItem,
  onReorderVaultItems,
  onUpdateVaultItem,
  onRenameVaultItem,
  recents,
  onOpenArchive,
  archiveMode,
}: ProjectsSidebarProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreatingVaultItem, setIsCreatingVaultItem] = useState(false)
  const [newVaultItemName, setNewVaultItemName] = useState('')
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [showAllVault, setShowAllVault] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)

  const VISIBLE_LIMIT = 3
  const visibleProjects = showAllProjects ? projects : projects.slice(0, VISIBLE_LIMIT)
  const hasMoreProjects = projects.length > VISIBLE_LIMIT
  const visibleVaultItems = showAllVault ? vaultItems : vaultItems.slice(0, VISIBLE_LIMIT)
  const hasMoreVault = vaultItems.length > VISIBLE_LIMIT
  const visibleCollections = showAllCollections ? collections : collections.slice(0, VISIBLE_LIMIT)
  const hasMoreCollections = collections.length > VISIBLE_LIMIT

  const projectInputRef = useRef<HTMLInputElement>(null)
  const collectionInputRef = useRef<HTMLInputElement>(null)
  const vaultInputRef = useRef<HTMLInputElement>(null)

  const projectSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const collectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const vaultSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleProjectDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = projects.findIndex(p => p.id === active.id)
    const newIndex = projects.findIndex(p => p.id === over.id)
    onReorderProjects(arrayMove(projects, oldIndex, newIndex))
  }

  function handleCollectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = collections.findIndex(c => c.id === active.id)
    const newIndex = collections.findIndex(c => c.id === over.id)
    onReorderCollections(arrayMove(collections, oldIndex, newIndex))
  }

  async function handleProjectSubmit() {
    const name = newProjectName.trim()
    if (name) await onCreateProject(name)
    setNewProjectName('')
    setIsCreatingProject(false)
  }

  async function handleCollectionSubmit() {
    const name = newCollectionName.trim()
    if (name) await onCreateCollection(name)
    setNewCollectionName('')
    setIsCreatingCollection(false)
  }

  function handleProjectKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleProjectSubmit()
    if (e.key === 'Escape') { setNewProjectName(''); setIsCreatingProject(false) }
  }

  function handleCollectionKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCollectionSubmit()
    if (e.key === 'Escape') { setNewCollectionName(''); setIsCreatingCollection(false) }
  }

  function handleVaultDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = vaultItems.findIndex(v => v.id === active.id)
    const newIndex = vaultItems.findIndex(v => v.id === over.id)
    onReorderVaultItems(arrayMove(vaultItems, oldIndex, newIndex))
  }

  async function handleVaultItemSubmit() {
    const name = newVaultItemName.trim()
    if (name) await onCreateVaultItem(name)
    setNewVaultItemName('')
    setIsCreatingVaultItem(false)
  }

  function handleVaultItemKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleVaultItemSubmit()
    if (e.key === 'Escape') { setNewVaultItemName(''); setIsCreatingVaultItem(false) }
  }

  function startCreatingVaultItem() {
    setIsCreatingVaultItem(true)
    setTimeout(() => vaultInputRef.current?.focus(), 0)
  }

  function startCreatingProject() {
    setIsCreatingProject(true)
    setTimeout(() => projectInputRef.current?.focus(), 0)
  }

  function startCreatingCollection() {
    setIsCreatingCollection(true)
    setTimeout(() => collectionInputRef.current?.focus(), 0)
  }

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] h-full">
      {/* Logo */}
      <div className="px-4 py-1 border-b border-[var(--color-border)] flex items-center">
        <Image
          src="/notehub_logo_v6.png"
          alt="NoteHUB"
          width={280}
          height={96}
          quality={100}
          className="h-20 w-auto"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {/* Scrollable content: projects + bookmarks */}
      <div className="flex-1 overflow-y-auto p-2 pb-4 min-h-0">

        {/* ── Recent ── */}
        {recents.length > 0 && (() => {
          type RecentResolved =
            | (Project & { type: 'project' })
            | (typeof vaultItems[number] & { type: 'vault' })
            | (typeof collections[number] & { type: 'collection' })
          const resolvedRecents = recents.flatMap((r): RecentResolved[] => {
            if (r.type === 'project') {
              const p = projects.find(x => x.id === r.id)
              return p ? [{ ...p, type: 'project' as const }] : []
            } else if (r.type === 'vault') {
              const v = vaultItems.find(x => x.id === r.id)
              return v ? [{ ...v, type: 'vault' as const }] : []
            } else {
              const c = collections.find(x => x.id === r.id)
              return c ? [{ ...c, type: 'collection' as const }] : []
            }
          })
          if (resolvedRecents.length === 0) return null
          return (
            <>
              <div className="flex items-center px-2 py-0.5 mb-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
                  Recent
                </p>
              </div>
              <div className="px-2 flex flex-col gap-1 mb-1">
                {resolvedRecents.map(item => {
                  const isActive = item.type === 'project'
                    ? item.id === activeProjectId
                    : item.type === 'vault'
                    ? item.id === activeVaultItemId
                    : item.id === activeCollectionId
                  return (
                    <div
                      key={item.id}
                      onClick={() => item.type === 'project' ? onSelectProject(item.id) : item.type === 'vault' ? onSelectVaultItem(item.id) : onSelectCollection(item.id)}
                      className={cn(
                        'flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer select-none transition-colors overflow-hidden',
                        isActive ? 'bg-[var(--color-bg-tertiary)]' : 'hover:bg-[var(--color-bg-secondary)]'
                      )}
                    >
                      {item.type === 'project' ? (
                        <FolderOpen size={15} className="flex-shrink-0" style={{ color: item.color }} />
                      ) : item.type === 'vault' ? (
                        <Vault size={15} className="flex-shrink-0" style={{ color: item.color }} />
                      ) : (
                        <Bookmark size={14} className="flex-shrink-0" style={{ color: item.color, fill: item.color }} />
                      )}
                      <span className={cn('text-sm truncate text-[var(--color-text-primary)]', isActive && 'font-semibold')}>
                        {item.name}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="my-2 border-t border-[var(--color-border)]" />
            </>
          )
        })()}

        {/* ── Vault ── */}
        <div className="flex items-center justify-between px-2 mb-0.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
              Vault
            </p>
            {hasMoreVault && (
              <button
                onClick={() => setShowAllVault(v => !v)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showAllVault ? '↑ Less' : 'View all →'}
              </button>
            )}
          </div>
          <button
            onClick={startCreatingVaultItem}
            title="New vault item"
            className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        <DndContext
          sensors={vaultSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleVaultDragEnd}
        >
          <SortableContext
            items={vaultItems.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="px-2 flex flex-col gap-1">
              {visibleVaultItems.map(item => (
                <VaultItem
                  key={item.id}
                  item={item}
                  isActive={item.id === activeVaultItemId}
                  onSelect={onSelectVaultItem}
                  onUpdateColor={(color) => onUpdateVaultItem(item.id, color)}
                  onRename={(name) => onRenameVaultItem(item.id, name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {isCreatingVaultItem && (
          <div className="mt-1 px-1">
            <input
              ref={vaultInputRef}
              type="text"
              value={newVaultItemName}
              onChange={e => setNewVaultItemName(e.target.value)}
              onKeyDown={handleVaultItemKeyDown}
              onBlur={handleVaultItemSubmit}
              placeholder="Vault item name…"
              className="w-full text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none ring-2 ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        )}

        {/* ── Divider ── */}
        <div className="my-3 border-t border-[var(--color-border)]" />

        {/* ── Projects ── */}
        <div className="flex items-center justify-between px-2 py-0.5 mb-0.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
              Projects
            </p>
            {hasMoreProjects && (
              <button
                onClick={() => setShowAllProjects(v => !v)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showAllProjects ? '↑ Less' : 'View all →'}
              </button>
            )}
          </div>
          <button
            onClick={startCreatingProject}
            title="New project"
            className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="px-2 flex flex-col gap-1">
          <DndContext
            sensors={projectSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleProjectDragEnd}
          >
            <SortableContext
              items={visibleProjects.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleProjects.map(project => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isActive={project.id === activeProjectId}
                  onSelect={onSelectProject}
                  onUpdateColor={(color) => onUpdateProject(project.id, color)}
                  onRename={(name) => onRenameProject(project.id, name)}
                />
              ))}
            </SortableContext>
          </DndContext>

        </div>

        {isCreatingProject && (
          <div className="mt-1 px-1">
            <input
              ref={projectInputRef}
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={handleProjectKeyDown}
              onBlur={handleProjectSubmit}
              placeholder="Project name…"
              className="w-full text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none ring-2 ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        )}

        {/* ── Divider ── */}
        <div className="my-3 border-t border-[var(--color-border)]" />

        {/* ── Bookmarks ── */}
        <div className="flex items-center justify-between px-2 mb-0.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
              Bookmarks
            </p>
            {hasMoreCollections && (
              <button
                onClick={() => setShowAllCollections(v => !v)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showAllCollections ? '↑ Less' : 'View all →'}
              </button>
            )}
          </div>
          <button
            onClick={startCreatingCollection}
            title="New collection"
            className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        <DndContext
          sensors={collectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCollectionDragEnd}
        >
          <SortableContext
            items={visibleCollections.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
          <div className="px-2 flex flex-col gap-1">
            {visibleCollections.map(collection => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                isActive={collection.id === activeCollectionId}
                onSelect={onSelectCollection}
                onUpdateColor={(color) => onUpdateCollection(collection.id, color)}
              />
            ))}
          </div>
          </SortableContext>
        </DndContext>

        {isCreatingCollection && (
          <div className="mt-1 px-1">
            <input
              ref={collectionInputRef}
              type="text"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              onKeyDown={handleCollectionKeyDown}
              onBlur={handleCollectionSubmit}
              placeholder="Collection name…"
              className="w-full text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg px-3 py-2 outline-none ring-2 ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        )}


      </div>

      {/* Archive button */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={onOpenArchive}
          className={cn(
            'w-full flex items-center gap-2 h-9 px-3 rounded-lg text-sm transition-colors select-none',
            archiveMode
              ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
          )}
        >
          <Archive size={15} />
          Archive
        </button>
      </div>
    </aside>
  )
}
