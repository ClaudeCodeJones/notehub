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
import { Plus } from 'lucide-react'
import { ProjectItem } from './ProjectItem'
import { CollectionItem } from './CollectionItem'
import { cn } from '@/lib/utils'
import type { Project, BookmarkCollection } from '@/types'

interface ProjectsSidebarProps {
  projects: Project[]
  activeProjectId: string | null
  onSelectProject: (id: string) => void
  onCreateProject: (name: string) => Promise<Project | null>
  onReorderProjects: (projects: Project[]) => void
  collections: BookmarkCollection[]
  activeCollectionId: string | null
  onSelectCollection: (id: string) => void
  onCreateCollection: (name: string) => Promise<BookmarkCollection | null>
  onReorderCollections: (collections: BookmarkCollection[]) => void
}

export function ProjectsSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onReorderProjects,
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onReorderCollections,
}: ProjectsSidebarProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [showAllProjects, setShowAllProjects] = useState(false)

  const hasMoreProjects = projects.length > 10
  const visibleProjects = showAllProjects || !hasMoreProjects
    ? projects
    : [...projects].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 10)

  const projectInputRef = useRef<HTMLInputElement>(null)
  const collectionInputRef = useRef<HTMLInputElement>(null)

  const projectSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const collectionSensors = useSensors(
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

  function startCreatingProject() {
    setIsCreatingProject(true)
    setTimeout(() => projectInputRef.current?.focus(), 0)
  }

  function startCreatingCollection() {
    setIsCreatingCollection(true)
    setTimeout(() => collectionInputRef.current?.focus(), 0)
  }

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] h-full">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <Image
          src="/notehub_logo.jpeg"
          alt="NoteHUB"
          width={120}
          height={0}
          style={{ height: 'auto' }}
          priority
        />
      </div>

      {/* Scrollable content: projects + bookmarks */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">

        {/* ── Projects ── */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
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

        <div className="px-2">
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
                />
              ))}
            </SortableContext>
          </DndContext>

          {hasMoreProjects && (
            <button
              onClick={() => setShowAllProjects(v => !v)}
              className="w-full text-left px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showAllProjects ? 'Show less ←' : 'View all →'}
            </button>
          )}
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] rounded px-2 py-0.5">
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

        <DndContext
          sensors={collectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCollectionDragEnd}
        >
          <SortableContext
            items={collections.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {collections.map(collection => (
              <CollectionItem
                key={collection.id}
                collection={collection}
                isActive={collection.id === activeCollectionId}
                onSelect={onSelectCollection}
              />
            ))}
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
    </aside>
  )
}
