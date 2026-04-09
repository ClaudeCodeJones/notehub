'use client'

import { useState, useRef, useEffect } from 'react'
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
import { Plus, FolderOpen, Bookmark, Archive, Vault, Search, House, Image as ImageIcon } from 'lucide-react'
import { ProjectItem } from './ProjectItem'
import { CollectionItem } from './CollectionItem'
import { VaultItem } from './VaultItem'
import { cn } from '@/lib/utils'
import type { Project, BookmarkCollection, VaultItem as VaultItemType } from '@/types'
import type { RecentEntry } from '@/hooks/useRecents'


type FocusedSection = 'projects' | 'vault' | 'bookmarks' | 'photos' | null

interface ProjectsSidebarProps {
  projects: Project[]
  activeProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: (name: string) => Promise<Project | null>
  onReorderProjects: (projects: Project[]) => void
  onUpdateProject: (id: string, color: string) => void
  onRenameProject: (id: string, name: string) => void
  onArchiveProject: (id: string) => void
  collections: BookmarkCollection[]
  activeCollectionId: string | null
  onSelectCollection: (id: string) => void
  onCreateCollection: (name: string) => Promise<BookmarkCollection | null>
  onReorderCollections: (collections: BookmarkCollection[]) => void
  onUpdateCollection: (id: string, color: string) => void
  onRenameCollection: (id: string, name: string) => void
  vaultItems: VaultItemType[]
  activeVaultItemId: string | null
  onSelectVaultItem: (id: string) => void
  onCreateVaultItem: (name: string) => Promise<VaultItemType | null>
  onReorderVaultItems: (items: VaultItemType[]) => void
  onUpdateVaultItem: (id: string, color: string) => void
  onRenameVaultItem: (id: string, name: string) => void
  onOpenArchive: () => void
  archiveMode: boolean
  onOpenPhotos: () => void
  photosMode: boolean
  onUploadPhoto: (files: FileList) => Promise<void>
  onOpenSearch: () => void
  searchMode: boolean
  onOpenHome: () => void
  homeMode: boolean
  recents: RecentEntry[]
  focusedSection: FocusedSection
  onSwitchSection: (section: FocusedSection) => void
}

export function ProjectsSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onReorderProjects,
  onUpdateProject,
  onRenameProject,
  onArchiveProject,
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onReorderCollections,
  onUpdateCollection,
  onRenameCollection,
  vaultItems,
  activeVaultItemId,
  onSelectVaultItem,
  onCreateVaultItem,
  onReorderVaultItems,
  onUpdateVaultItem,
  onRenameVaultItem,
  onOpenArchive,
  archiveMode,
  onOpenPhotos,
  photosMode,
  onUploadPhoto,
  onOpenSearch,
  searchMode,
  onOpenHome,
  homeMode,
  recents,
  focusedSection,
  onSwitchSection,
}: ProjectsSidebarProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreatingVaultItem, setIsCreatingVaultItem] = useState(false)
  const [newVaultItemName, setNewVaultItemName] = useState('')

  function sortByRecent<T extends { id: string; sort_order: number }>(items: T[], type: RecentEntry['type']): T[] {
    return [...items].sort((a, b) => {
      const ai = recents.findIndex(r => r.type === type && r.id === a.id)
      const bi = recents.findIndex(r => r.type === type && r.id === b.id)
      if (ai === -1 && bi === -1) return a.sort_order - b.sort_order
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }

  const sortedProjects = sortByRecent(projects, 'project')
  const sortedVaultItems = sortByRecent(vaultItems, 'vault')
  const sortedCollections = sortByRecent(collections, 'collection')

  const visibleProjects = sortedProjects
  const visibleVaultItems = sortedVaultItems
  const visibleCollections = sortedCollections

  const projectInputRef = useRef<HTMLInputElement>(null)
  const collectionInputRef = useRef<HTMLInputElement>(null)
  const vaultInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const focusTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => { if (focusTimerRef.current) clearTimeout(focusTimerRef.current) }
  }, [])

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
    focusTimerRef.current = setTimeout(() => vaultInputRef.current?.focus(), 0)
  }

  function startCreatingProject() {
    setIsCreatingProject(true)
    focusTimerRef.current = setTimeout(() => projectInputRef.current?.focus(), 0)
  }

  function startCreatingCollection() {
    setIsCreatingCollection(true)
    focusTimerRef.current = setTimeout(() => collectionInputRef.current?.focus(), 0)
  }

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] h-full" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
      {/* Logo — click to return to Home */}
      <div className="px-4 py-1 border-b border-[var(--color-border)] flex items-center">
        <button onClick={onOpenHome} className="cursor-pointer focus:outline-none">
          <Image
            src="/notehub_newlogo_colour.png"
            alt="NoteHUB"
            width={280}
            height={96}
            quality={100}
            className="h-20 w-auto"
            style={{ objectFit: 'contain' }}
            priority
          />
        </button>
      </div>

      {/* Section switcher — visible only when inside a focused section */}
      {focusedSection !== null && (
        <div className="px-4 py-2 border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center justify-around">
            {([
              { key: 'projects',  icon: FolderOpen,  label: 'Projects'  },
              { key: 'vault',     icon: Vault,       label: 'Vault'     },
              { key: 'bookmarks', icon: Bookmark,    label: 'Bookmarks' },
              { key: 'photos',    icon: ImageIcon,   label: 'Photos'    },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => onSwitchSection(key)}
                title={label}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors text-[10px] font-medium',
                  focusedSection === key
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-2 pb-4 min-h-0">

        {/* ── Fallback: no section focused (home state) ── */}
        {focusedSection === null && (
          <>
            <button
              onClick={onOpenHome}
              className={cn(
                'flex items-center gap-2 h-10 md:h-8 w-full px-3 rounded-lg text-base md:text-sm select-none transition-colors mb-1',
                homeMode
                  ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              <House size={15} />
              Home
            </button>
          </>
        )}

        {/* ── Projects ── */}
        {focusedSection === 'projects' && (
          <>
            <div className="flex items-center justify-between px-2 py-0.5 mb-0.5">
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                Projects
              </p>
              <button
                onClick={startCreatingProject}
                title="New project"
                className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="px-2 flex flex-col gap-1">
              <DndContext sensors={projectSensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext items={visibleProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {visibleProjects.map(project => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      onSelect={onSelectProject}
                      onUpdateColor={(color) => onUpdateProject(project.id, color)}
                      onRename={(name) => onRenameProject(project.id, name)}
                      onArchive={() => onArchiveProject(project.id)}
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
          </>
        )}

        {/* ── Vault ── */}
        {focusedSection === 'vault' && (
          <>
            <div className="flex items-center justify-between px-2 mb-0.5">
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                Vault
              </p>
              <button
                onClick={startCreatingVaultItem}
                title="New vault item"
                className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <DndContext sensors={vaultSensors} collisionDetection={closestCenter} onDragEnd={handleVaultDragEnd}>
              <SortableContext items={vaultItems.map(v => v.id)} strategy={verticalListSortingStrategy}>
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
          </>
        )}

        {/* ── Bookmarks ── */}
        {focusedSection === 'bookmarks' && (
          <>
            <div className="flex items-center justify-between px-2 mb-0.5">
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-text-secondary)]">
                Bookmarks
              </p>
              <button
                onClick={startCreatingCollection}
                title="New collection"
                className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
            <DndContext sensors={collectionSensors} collisionDetection={closestCenter} onDragEnd={handleCollectionDragEnd}>
              <SortableContext items={visibleCollections.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="px-2 flex flex-col gap-1">
                  {visibleCollections.map(collection => (
                    <CollectionItem
                      key={collection.id}
                      collection={collection}
                      isActive={collection.id === activeCollectionId}
                      onSelect={onSelectCollection}
                      onUpdateColor={(color) => onUpdateCollection(collection.id, color)}
                      onRename={(name) => onRenameCollection(collection.id, name)}
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
          </>
        )}

        {/* ── Photos ── */}
        {focusedSection === 'photos' && (
          <div className="flex items-center justify-between px-2 mb-1">
            <button onClick={onOpenPhotos}>
              <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-accent)]">
                Photos
              </p>
            </button>
            <button
              onClick={() => photoInputRef.current?.click()}
              title="Upload photo"
              className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <Plus size={12} />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files?.length) {
                  onUploadPhoto(e.target.files)
                  onOpenPhotos()
                  e.target.value = ''
                }
              }}
            />
          </div>
        )}

      </div>

      {/* Bottom action bar */}
      <div className="px-4 py-3 border-t border-[var(--color-border)] flex-shrink-0 flex flex-col gap-1">
        <button
          onClick={onOpenSearch}
          className={cn(
            'w-full flex items-center gap-2 h-11 md:h-9 px-3 rounded-lg text-base md:text-sm transition-colors select-none',
            searchMode
              ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-semibold'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
          )}
        >
          <Search size={15} />
          Search
        </button>
        <button
          onClick={onOpenArchive}
          className={cn(
            'w-full flex items-center gap-2 h-11 md:h-9 px-3 rounded-lg text-base md:text-sm transition-colors select-none',
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
