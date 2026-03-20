'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Trash2 } from 'lucide-react'
import { Toolbar } from './Toolbar'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

interface EditorPanelProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function EditorPanel({ note, onUpdate, onDelete }: EditorPanelProps) {
  const [title, setTitle] = useState(note.title)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const titleTimer = useRef<NodeJS.Timeout | null>(null)
  const contentTimer = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: note.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (contentTimer.current) clearTimeout(contentTimer.current)
      setSaveStatus('saving')
      contentTimer.current = setTimeout(async () => {
        await onUpdate(note.id, { content: html })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, 600)
    },
  })

  // Focus title for new blank notes
  useEffect(() => {
    if (!note.title && !note.content) {
      titleRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (titleTimer.current) clearTimeout(titleTimer.current)
      if (contentTimer.current) clearTimeout(contentTimer.current)
    }
  }, [])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setTitle(value)
    if (titleTimer.current) clearTimeout(titleTimer.current)
    setSaveStatus('saving')
    titleTimer.current = setTimeout(async () => {
      await onUpdate(note.id, { title: value })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 600)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('start')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    await onDelete(note.id)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)] h-full overflow-hidden">
      {/* Formatting toolbar */}
      <Toolbar editor={editor} />

      {/* Title */}
      <div className="px-8 pt-8 pb-3 flex-shrink-0">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full text-[1.75rem] font-bold leading-tight bg-transparent outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
      </div>

      {/* Rich text editor */}
      <div className="flex-1 overflow-y-auto px-8 py-2 min-h-0">
        <EditorContent editor={editor} className="notehub-editor" />
      </div>

      {/* Footer: save status + delete */}
      <div className="px-8 py-3 border-t border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-[var(--color-text-muted)]">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
        </span>

        <button
          onClick={handleDelete}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 150)}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors',
            confirmDelete
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
          )}
        >
          <Trash2 size={12} />
          {confirmDelete ? 'Are you sure?' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
