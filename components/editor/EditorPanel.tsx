'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { ChevronLeft, FileText, CheckSquare, ChevronDown } from 'lucide-react'
import { Toolbar } from './Toolbar'
import { cn } from '@/lib/utils'
import type { Note } from '@/types'

const NOTE_TYPE_KEY = 'notehub-last-note-type'

interface EditorPanelProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => Promise<void>
  onUpdateNoteType: (id: string, note_type: 'checkbox' | 'note') => Promise<void>
  onMobileBack?: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export function EditorPanel({ note, onUpdate, onUpdateNoteType, onMobileBack }: EditorPanelProps) {
  const [title, setTitle] = useState(note.title)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const titleTimer = useRef<NodeJS.Timeout | null>(null)
  const contentTimer = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'taskItem') return "Press 'Enter' to add list item"
          return 'Start writing...'
        },
        includeChildren: true,
      }),
    ],
    content: (() => { try { return JSON.parse(note.content) } catch { return note.content || '' } })(),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON())
      if (contentTimer.current) clearTimeout(contentTimer.current)
      setSaveStatus('saving')
      contentTimer.current = setTimeout(async () => {
        await onUpdate(note.id, { content: json })
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

  useEffect(() => {
    if (!typeDropdownOpen) return
    function handleOutside(e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [typeDropdownOpen])

  const CHECKBOX_CONTENT = '{"type":"doc","content":[{"type":"taskList","content":[{"type":"taskItem","attrs":{"checked":false},"content":[{"type":"paragraph"}]}]}]}'
  const NOTE_CONTENT = '{"type":"doc","content":[{"type":"paragraph"}]}'

  const handleSelectNoteType = useCallback(async (type: 'checkbox' | 'note') => {
    setTypeDropdownOpen(false)
    localStorage.setItem(NOTE_TYPE_KEY, type)
    const newContent = type === 'checkbox' ? CHECKBOX_CONTENT : NOTE_CONTENT
    if (editor) {
      editor.commands.setContent(JSON.parse(newContent))
    }
    await Promise.all([
      onUpdateNoteType(note.id, type),
      onUpdate(note.id, { content: newContent }),
    ])
  }, [note.id, onUpdateNoteType, onUpdate, editor]) // eslint-disable-line react-hooks/exhaustive-deps

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

return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-primary)] h-full overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
        <button
          onClick={onMobileBack}
          className="p-1 -ml-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors flex-shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {title || 'Untitled'}
        </span>
      </div>

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

      {/* Note type pill bar */}
      <div className="px-8 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-full px-3 py-1.5 max-w-xs">
          <button
            onClick={() => {
              if (!editor) return
              if (note.note_type === 'checkbox') {
                editor.chain().focus('end').splitListItem('taskItem').run()
              } else {
                editor.chain().focus('end').insertContent({ type: 'paragraph' }).run()
              }
            }}
            className="flex-1 text-sm text-[var(--color-text-muted)] text-left"
          >+ Add text</button>
          {note.note_type === 'checkbox'
            ? <CheckSquare size={14} className="text-[var(--color-text-muted)]" />
            : <FileText size={14} className="text-[var(--color-text-muted)]" />
          }
          <div ref={typeDropdownRef} className="relative">
            <button
              onClick={() => setTypeDropdownOpen(v => !v)}
              className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ChevronDown size={14} />
            </button>
            {typeDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-[130px]">
                <button
                  onClick={() => handleSelectNoteType('checkbox')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    note.note_type === 'checkbox'
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  <CheckSquare size={14} />
                  Checkbox
                </button>
                <button
                  onClick={() => handleSelectNoteType('note')}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    note.note_type === 'note'
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  <FileText size={14} />
                  Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rich text editor */}
      <div className="flex-1 overflow-y-auto px-8 py-2 min-h-0">
        <EditorContent
          editor={editor}
          className={cn('notehub-editor', note.note_type === 'note' && 'notehub-note-editor')}
        />
      </div>

      {/* Footer: save status */}
      <div className="px-8 py-3 border-t border-[var(--color-border)] flex items-center flex-shrink-0">
        <span className="text-xs text-[var(--color-text-muted)]">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
        </span>
      </div>
    </div>
  )
}
