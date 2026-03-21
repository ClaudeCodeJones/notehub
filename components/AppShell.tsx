'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectsSidebar } from './sidebar/ProjectsSidebar'
import { NotesList } from './notes/NotesList'
import { EditorPanel } from './editor/EditorPanel'
import { BookmarksList } from './bookmarks/BookmarksList'
import { BookmarkDetail } from './bookmarks/BookmarkDetail'
import { useProjects } from '@/hooks/useProjects'
import { useNotes } from '@/hooks/useNotes'
import { useRealtime } from '@/hooks/useRealtime'
import { useBookmarkCollections } from '@/hooks/useBookmarkCollections'
import { useBookmarks } from '@/hooks/useBookmarks'

type MobileView = 'sidebar' | 'notes' | 'editor'

export function AppShell() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<MobileView>('sidebar')

  const {
    projects,
    createProject,
    updateProject,
    renameProject,
    reorderProjects,
    updateFromRealtime: updateProjectRealtime,
    insertFromRealtime: insertProject,
    deleteFromRealtime: deleteProject,
  } = useProjects()

  const {
    notes,
    loading: notesLoading,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    updateFromRealtime: updateNote_rt,
    insertFromRealtime: insertNote_rt,
    deleteFromRealtime: deleteNote_rt,
  } = useNotes(activeProjectId)

  const { collections, createCollection, reorderCollections, updateBookmarkCollection } = useBookmarkCollections()

  const { bookmarks, loading: bookmarksLoading, createBookmark, deleteBookmark, reorderBookmarks } =
    useBookmarks(activeCollectionId)

  useRealtime({
    onProjectInsert: insertProject,
    onProjectUpdate: updateProjectRealtime,
    onProjectDelete: deleteProject,
    onNoteInsert: insertNote_rt,
    onNoteUpdate: updateNote_rt,
    onNoteDelete: deleteNote_rt,
  })

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null
  const activeCollection = collections.find(c => c.id === activeCollectionId) ?? null
  const activeBookmark = bookmarks.find(b => b.id === activeBookmarkId) ?? null

  // Selecting a project clears bookmark mode and vice-versa
  function handleSelectProject(id: string) {
    setActiveProjectId(id)
    setActiveNoteId(null)
    setActiveCollectionId(null)
    setActiveBookmarkId(null)
    setMobileView('notes')
  }

  function handleSelectCollection(id: string) {
    setActiveCollectionId(id)
    setActiveBookmarkId(null)
    setActiveProjectId(null)
    setActiveNoteId(null)
    setMobileView('notes')
  }

  function handleSelectNote(id: string) {
    setActiveNoteId(id)
    setMobileView('editor')
  }

  function handleSelectBookmark(id: string) {
    setActiveBookmarkId(id)
    setMobileView('editor')
  }

  function handleMobileBack() {
    if (mobileView === 'editor') setMobileView('notes')
    else if (mobileView === 'notes') setMobileView('sidebar')
  }

  async function handleCreateNote() {
    const note = await createNote()
    if (note) {
      setActiveNoteId(note.id)
      setMobileView('editor')
    }
  }

  async function handleDeleteNote(id: string) {
    await deleteNote(id)
    setActiveNoteId(null)
    setMobileView('notes')
  }

  async function handleDeleteBookmark(id: string) {
    await deleteBookmark(id)
    setActiveBookmarkId(null)
    setMobileView('notes')
  }

  const inBookmarkMode = activeCollectionId !== null

  const emptyMessage = inBookmarkMode
    ? 'Select or add a bookmark'
    : activeProject
    ? 'Pick a note to start reading, or hit + to create a new one'
    : 'Select a project to get started'

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-bg-primary)] relative md:flex">

      {/* Sidebar panel */}
      <div className={cn(
        'absolute inset-0 h-full transition-transform duration-300 ease-in-out',
        'md:relative md:inset-auto md:translate-x-0',
        mobileView === 'sidebar' ? 'translate-x-0' : '-translate-x-full',
      )}>
        <ProjectsSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={createProject}
          onReorderProjects={reorderProjects}
          onUpdateProject={updateProject}
          onRenameProject={renameProject}
          collections={collections}
          activeCollectionId={activeCollectionId}
          onSelectCollection={handleSelectCollection}
          onCreateCollection={createCollection}
          onReorderCollections={reorderCollections}
          onUpdateCollection={updateBookmarkCollection}
        />
      </div>

      {/* Middle panel: notes or bookmarks */}
      <div className={cn(
        'absolute inset-0 h-full transition-transform duration-300 ease-in-out',
        'md:relative md:inset-auto md:translate-x-0',
        mobileView === 'sidebar' ? 'translate-x-full' :
        mobileView === 'editor' ? '-translate-x-full' :
        'translate-x-0',
      )}>
        {inBookmarkMode ? (
          <BookmarksList
            collection={activeCollection}
            bookmarks={bookmarks}
            activeBookmarkId={activeBookmarkId}
            loading={bookmarksLoading}
            onSelectBookmark={handleSelectBookmark}
            onCreateBookmark={createBookmark}
            onReorderBookmarks={reorderBookmarks}
            onMobileBack={handleMobileBack}
          />
        ) : (
          <NotesList
            project={activeProject}
            notes={notes}
            activeNoteId={activeNoteId}
            loading={notesLoading}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
            onReorderNotes={reorderNotes}
            onMobileBack={handleMobileBack}
          />
        )}
      </div>

      {/* Right panel: editor, bookmark detail, or empty state */}
      <div className={cn(
        'absolute inset-0 h-full flex flex-col transition-transform duration-300 ease-in-out',
        'md:relative md:inset-auto md:flex-1 md:translate-x-0',
        mobileView === 'editor' ? 'translate-x-0' : 'translate-x-full',
      )}>
        {activeBookmark ? (
          <BookmarkDetail
            key={activeBookmark.id}
            bookmark={activeBookmark}
            onDelete={handleDeleteBookmark}
            onMobileBack={handleMobileBack}
          />
        ) : activeNote ? (
          <EditorPanel
            key={activeNote.id}
            note={activeNote}
            onUpdate={updateNote}
            onMobileBack={handleMobileBack}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] select-none px-6 text-center">
            <FileText size={48} className="mb-4 text-[var(--color-accent)]" style={{ opacity: 0.5 }} />
            <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
          </div>
        )}
      </div>

    </div>
  )
}
