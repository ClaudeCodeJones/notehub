'use client'

import { useState, useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import { ChevronLeft, Archive } from 'lucide-react'
import { Toolbar } from './Toolbar'
import { AppHeader } from '@/components/AppHeader'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

interface EditorPanelProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onMobileBack?: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function EditorPanel({ note, onUpdate, onArchive, onMobileBack }: EditorPanelProps) {
  const [title, setTitle] = useState(note.title)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const titleRef = useRef<HTMLInputElement>(null)
  const titleTimer = useRef<NodeJS.Timeout | null>(null)
  const contentTimer = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      TaskList,
      TaskItem.configure({ nested: true }).extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.splitListItem('taskItem'),
          }
        },
      }),
      TextStyle,
      Color,
      Link.configure({ openOnClick: true, autolink: true }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'taskItem') return "Press 'Enter' to add list item"
          return 'Start writing...'
        },
        includeChildren: true,
      }),
    ],
    content: (() => { try { return JSON.parse(note.content) } catch { return note.content || { type: 'doc', content: [{ type: 'paragraph' }] } } })(),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON())
      if (contentTimer.current) clearTimeout(contentTimer.current)
      setSaveStatus('saving')
      contentTimer.current = setTimeout(async () => {
        try {
          await onUpdate(note.id, { content: json })
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch {
          setSaveStatus('idle')
        }
      }, 600)
    },
  })

  // Focus title for new blank notes (on mount only)
  useEffect(() => {
    if (!note.title && !note.content) {
      titleRef.current?.focus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
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
      try {
        await onUpdate(note.id, { title: value })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 600)
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('start')
    }
  }

return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)] h-full overflow-hidden">
      <AppHeader>
        {onMobileBack && (
          <button
            onClick={onMobileBack}
            className="md:hidden p-1 rounded-md text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </AppHeader>

      {/* Formatting toolbar */}
      <Toolbar editor={editor} noteType={note.note_type} />

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
      <div className={cn('flex-1 overflow-y-auto px-8 py-2 min-h-0 notehub-note-editor', note.note_type === 'note' && 'note-type-note')}>
        <EditorContent
          editor={editor}
          className="notehub-editor"
        />
      </div>

      {/* Footer: save status + archive */}
      <div className="px-8 py-3 border-t border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <span className="text-xs text-[var(--color-text-muted)]">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
        </span>
        <button
          onClick={() => onArchive(note.id)}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
        >
          <Archive size={13} />
          Archive
        </button>
      </div>
    </div>
  )
}
