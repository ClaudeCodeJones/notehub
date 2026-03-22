'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectsSidebar } from './sidebar/ProjectsSidebar'
import { NotesList } from './notes/NotesList'
import { EditorPanel } from './editor/EditorPanel'
import { BookmarksList } from './bookmarks/BookmarksList'
import { BookmarkDetail } from './bookmarks/BookmarkDetail'
import { ArchivePanel } from './archive/ArchivePanel'
import { SearchPanel } from './search/SearchPanel'
import { HomePanel } from './home/HomePanel'
import { useProjects } from '@/hooks/useProjects'
import { useNotes } from '@/hooks/useNotes'
import { useRealtime } from '@/hooks/useRealtime'
import { useBookmarkCollections } from '@/hooks/useBookmarkCollections'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useRecents } from '@/hooks/useRecents'
import { useVaultItems } from '@/hooks/useVaultItems'
import { useSwipeBack } from '@/hooks/useSwipeBack'
import { useSearch } from '@/hooks/useSearch'
import { PhotoList } from './photos/PhotoList'
import { PhotoViewer } from './photos/PhotoViewer'
import { usePhotos } from '@/hooks/usePhotos'
import type { NoteResult, BookmarkResult } from '@/hooks/useSearch'

type MobileView = 'sidebar' | 'notes' | 'editor'

export function AppShell() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [activeBookmarkId, setActiveBookmarkId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<MobileView>('sidebar')
  const [archiveMode, setArchiveMode] = useState(false)
  const [photosMode, setPhotosMode] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [homeMode, setHomeMode] = useState(true)
  const { photos, archivedPhotos, loading: photosLoading, uploading, selectedPhoto, setSelectedPhoto, uploadPhoto, archivePhoto, restorePhoto, permanentDeletePhoto, deletePhoto } = usePhotos()
  const { query, setQuery, noteResults, bookmarkResults, loading: searchLoading } = useSearch()
  const [activeVaultItemId, setActiveVaultItemId] = useState<string | null>(null)

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
    updateNoteType,
    archiveNote,
    pinNote,
    unpinNote,
    reorderNotes,
    updateFromRealtime: updateNote_rt,
    insertFromRealtime: insertNote_rt,
    deleteFromRealtime: deleteNote_rt,
  } = useNotes(activeProjectId, activeVaultItemId)

  const { collections, createCollection, reorderCollections, updateBookmarkCollection } = useBookmarkCollections()
  const { recents, recordRecent } = useRecents()
  const { vaultItems, createVaultItem, updateVaultItem, renameVaultItem, reorderVaultItems } = useVaultItems()

  const { bookmarks, loading: bookmarksLoading, createBookmark, archiveBookmark, reorderBookmarks } =
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
  const activeVaultItem = vaultItems.find(v => v.id === activeVaultItemId) ?? null
  const activeNote = notes.find(n => n.id === activeNoteId) ?? null
  const activeCollection = collections.find(c => c.id === activeCollectionId) ?? null
  const activeBookmark = bookmarks.find(b => b.id === activeBookmarkId) ?? null

  function handleSelectProject(id: string) {
    setActiveProjectId(id)
    setActiveNoteId(null)
    setActiveCollectionId(null)
    setActiveBookmarkId(null)
    setActiveVaultItemId(null)
    setArchiveMode(false)
    setPhotosMode(false)
    setSearchMode(false)
    setHomeMode(false)
    setMobileView('notes')
    recordRecent({ id, type: 'project' })
  }

  function handleSelectCollection(id: string) {
    setActiveCollectionId(id)
    setActiveBookmarkId(null)
    setActiveProjectId(null)
    setActiveNoteId(null)
    setActiveVaultItemId(null)
    setArchiveMode(false)
    setPhotosMode(false)
    setSearchMode(false)
    setHomeMode(false)
    setMobileView('notes')
    recordRecent({ id, type: 'collection' })
  }

  function handleSelectVaultItem(id: string) {
    setActiveVaultItemId(id)
    setActiveNoteId(null)
    setActiveProjectId(null)
    setActiveCollectionId(null)
    setActiveBookmarkId(null)
    setArchiveMode(false)
    setPhotosMode(false)
    setSearchMode(false)
    setHomeMode(false)
    setMobileView('notes')
    recordRecent({ id, type: 'vault' })
  }

  function handleOpenPhotos() {
    setPhotosMode(true)
    setArchiveMode(false)
    setSearchMode(false)
    setHomeMode(false)
  }

  function handleOpenArchive() {
    setArchiveMode(true)
    setPhotosMode(false)
    setSearchMode(false)
    setHomeMode(false)
    setActiveProjectId(null)
    setActiveNoteId(null)
    setActiveCollectionId(null)
    setActiveBookmarkId(null)
    setActiveVaultItemId(null)
    setMobileView('notes')
  }

  function handleOpenSearch() {
    setSearchMode(true)
    setArchiveMode(false)
    setPhotosMode(false)
    setHomeMode(false)
    setMobileView('notes')
  }

  function handleOpenHome() {
    setHomeMode(true)
    setSearchMode(false)
    setArchiveMode(false)
    setPhotosMode(false)
    setActiveProjectId(null)
    setActiveNoteId(null)
    setActiveCollectionId(null)
    setActiveBookmarkId(null)
    setActiveVaultItemId(null)
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

  function handleSearchSelectNote(note: NoteResult) {
    setSearchMode(false)
    setActiveNoteId(note.id)
    setActiveBookmarkId(null)
    setActiveCollectionId(null)
    setArchiveMode(false)
    setPhotosMode(false)
    if (note.project_id) {
      setActiveProjectId(note.project_id)
      setActiveVaultItemId(null)
      recordRecent({ id: note.project_id, type: 'project' })
    } else if (note.vault_id) {
      setActiveVaultItemId(note.vault_id)
      setActiveProjectId(null)
      recordRecent({ id: note.vault_id, type: 'vault' })
    }
    setMobileView('editor')
  }

  function handleSearchSelectBookmark(bookmark: BookmarkResult) {
    setSearchMode(false)
    setActiveBookmarkId(bookmark.id)
    setActiveCollectionId(bookmark.collection_id)
    setActiveProjectId(null)
    setActiveNoteId(null)
    setActiveVaultItemId(null)
    setArchiveMode(false)
    setPhotosMode(false)
    setMobileView('editor')
    recordRecent({ id: bookmark.collection_id, type: 'collection' })
  }

  function handleMobileBack() {
    if (mobileView === 'editor') setMobileView('notes')
    else if (mobileView === 'notes') setMobileView('sidebar')
  }

  useSwipeBack(handleMobileBack, mobileView !== 'sidebar')

  async function handleFabCreateProject() {
    const project = await createProject('New Project')
    if (project) handleSelectProject(project.id)
  }

  async function handleFabCreateCollection() {
    const collection = await createCollection('New Collection')
    if (collection) handleSelectCollection(collection.id)
  }

  async function handleFabCreateVaultItem() {
    const item = await createVaultItem('New Vault Item')
    if (item) handleSelectVaultItem(item.id)
  }

  async function handleCreateNote(type: 'checkbox' | 'note' = 'note') {
    const note = await createNote(type)
    if (note) {
      setActiveNoteId(note.id)
      setMobileView('editor')
    }
  }

  async function handleArchiveNote(id: string) {
    await archiveNote(id)
    setActiveNoteId(null)
    setMobileView('notes')
  }

  async function handleArchiveBookmark(id: string) {
    await archiveBookmark(id)
    setActiveBookmarkId(null)
    setMobileView('notes')
  }

  const inBookmarkMode = activeCollectionId !== null
  const activeNoteContainer = activeProject ?? activeVaultItem

  const emptyMessage = inBookmarkMode
    ? 'Select or add a bookmark'
    : activeNoteContainer
    ? 'Pick a note to start reading, or hit + to create a new one'
    : ''

  return (
    <div className="h-full overflow-hidden bg-[var(--color-bg-primary)] relative md:flex">

      {/* Sidebar panel */}
      <div
        className={cn(
          'absolute inset-0 h-full transition-transform duration-300 ease-in-out',
          'md:relative md:inset-auto md:translate-x-0',
          homeMode && 'md:hidden',
          mobileView === 'sidebar' ? 'translate-x-0' : '-translate-x-full',
        )}
      >
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
          vaultItems={vaultItems}
          activeVaultItemId={activeVaultItemId}
          onSelectVaultItem={handleSelectVaultItem}
          onCreateVaultItem={createVaultItem}
          onReorderVaultItems={reorderVaultItems}
          onUpdateVaultItem={updateVaultItem}
          onRenameVaultItem={renameVaultItem}
          recents={recents}
          onOpenArchive={handleOpenArchive}
          archiveMode={archiveMode}
          onOpenPhotos={handleOpenPhotos}
          photosMode={photosMode}
          onUploadPhoto={uploadPhoto}
          onOpenSearch={handleOpenSearch}
          searchMode={searchMode}
          onOpenHome={handleOpenHome}
          homeMode={homeMode}
        />
      </div>

      {/* Middle panel */}
      <div className={cn(
        'absolute inset-0 h-full transition-transform duration-300 ease-in-out',
        'md:relative md:inset-auto md:translate-x-0',
        homeMode && 'md:flex-1',
        mobileView === 'sidebar' ? 'translate-x-full' :
        mobileView === 'editor' ? '-translate-x-full' :
        'translate-x-0',
      )}>
        {homeMode ? (
          <HomePanel
            projects={projects}
            vaultItems={vaultItems}
            collections={collections}
            recents={recents}
            onSelectProject={handleSelectProject}
            onSelectCollection={handleSelectCollection}
            onSelectVaultItem={handleSelectVaultItem}
            onOpenPhotos={handleOpenPhotos}
            onOpenSearch={handleOpenSearch}
            onCreateProject={handleFabCreateProject}
            onCreateCollection={handleFabCreateCollection}
            onCreateVaultItem={handleFabCreateVaultItem}
          />
        ) : searchMode ? (
          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            noteResults={noteResults}
            bookmarkResults={bookmarkResults}
            loading={searchLoading}
            onSelectNote={handleSearchSelectNote}
            onSelectBookmark={handleSearchSelectBookmark}
          />
        ) : photosMode ? (
          <PhotoList
            photos={photos}
            loading={photosLoading}
            uploading={uploading}
            selectedPhoto={selectedPhoto}
            onSelectPhoto={setSelectedPhoto}
            onUpload={uploadPhoto}
            onArchive={archivePhoto}
            onDelete={deletePhoto}
          />
        ) : archiveMode ? (
          <ArchivePanel
            onClose={() => setArchiveMode(false)}
            archivedPhotos={archivedPhotos}
            onRestorePhoto={restorePhoto}
            onDeletePhoto={permanentDeletePhoto}
          />
        ) : inBookmarkMode ? (
          <BookmarksList
            collection={activeCollection}
            bookmarks={bookmarks}
            activeBookmarkId={activeBookmarkId}
            loading={bookmarksLoading}
            onSelectBookmark={handleSelectBookmark}
            onCreateBookmark={createBookmark}
            onReorderBookmarks={reorderBookmarks}
            onArchiveBookmark={handleArchiveBookmark}
            onMobileBack={handleMobileBack}
          />
        ) : (
          <NotesList
            project={activeNoteContainer}
            notes={notes}
            activeNoteId={activeNoteId}
            loading={notesLoading}
            onSelectNote={handleSelectNote}
            onCreateNote={(type) => handleCreateNote(type)}
            onArchiveNote={handleArchiveNote}
            onPinNote={pinNote}
            onUnpinNote={unpinNote}
            onReorderNotes={reorderNotes}
            onMobileBack={handleMobileBack}
          />
        )}
      </div>

      {/* Right panel */}
      <div className={cn(
        'absolute inset-0 h-full flex flex-col transition-transform duration-300 ease-in-out',
        'md:relative md:inset-auto md:flex-1 md:translate-x-0',
        homeMode && 'md:hidden',
        photosMode ? 'translate-x-0' : mobileView === 'editor' ? 'translate-x-0' : 'translate-x-full',
      )}>
        {photosMode ? (
          <PhotoViewer photo={selectedPhoto} />
        ) : activeBookmark ? (
          <BookmarkDetail
            key={activeBookmark.id}
            bookmark={activeBookmark}
            onArchive={handleArchiveBookmark}
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
            {emptyMessage && (
              <>
                <FileText size={48} className="mb-4 text-[var(--color-accent)]" style={{ opacity: 0.5 }} />
                <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
