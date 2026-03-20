'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
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

export function AppShell() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | null>(null)

  const {
    projects,
    createProject,
    reorderProjects,
    updateFromRealtime: updateProject,
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

  const { collections, createCollection, reorderCollections } = useBookmarkCollections()

  const { bookmarks, loading: bookmarksLoading, createBookmark, deleteBookmark, reorderBookmarks } =
    useBookmarks(activeCollectionId)

  useRealtime({
    onProjectInsert: insertProject,
    onProjectUpdate: updateProject,
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
  }

  function handleSelectCollection(id: string) {
    setActiveCollectionId(id)
    setActiveBookmarkId(null)
    setActiveProjectId(null)
    setActiveNoteId(null)
  }

  async function handleCreateNote() {
    const note = await createNote()
    if (note) setActiveNoteId(note.id)
  }

  async function handleDeleteNote(id: string) {
    await deleteNote(id)
    setActiveNoteId(null)
  }

  async function handleDeleteBookmark(id: string) {
    await deleteBookmark(id)
    setActiveBookmarkId(null)
  }

  const inBookmarkMode = activeCollectionId !== null

  const emptyMessage = inBookmarkMode
    ? 'Select or add a bookmark'
    : activeProject
    ? 'Select or create a note'
    : 'Select a project to get started'

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      <ProjectsSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={createProject}
        onReorderProjects={reorderProjects}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={handleSelectCollection}
        onCreateCollection={createCollection}
        onReorderCollections={reorderCollections}
      />

      {/* Middle panel: notes or bookmarks */}
      {inBookmarkMode ? (
        <BookmarksList
          collection={activeCollection}
          bookmarks={bookmarks}
          activeBookmarkId={activeBookmarkId}
          loading={bookmarksLoading}
          onSelectBookmark={setActiveBookmarkId}
          onCreateBookmark={createBookmark}
          onReorderBookmarks={reorderBookmarks}
        />
      ) : (
        <NotesList
          project={activeProject}
          notes={notes}
          activeNoteId={activeNoteId}
          loading={notesLoading}
          onSelectNote={setActiveNoteId}
          onCreateNote={handleCreateNote}
          onReorderNotes={reorderNotes}
        />
      )}

      {/* Right panel: editor, bookmark detail, or empty state */}
      {activeBookmark ? (
        <BookmarkDetail
          key={activeBookmark.id}
          bookmark={activeBookmark}
          onDelete={handleDeleteBookmark}
        />
      ) : activeNote ? (
        <EditorPanel
          key={activeNote.id}
          note={activeNote}
          onUpdate={updateNote}
          onDelete={handleDeleteNote}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] select-none">
          <FileText size={40} className="mb-3 text-[var(--color-text-muted)]" style={{ opacity: 0.4 }} />
          <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
