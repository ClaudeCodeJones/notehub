'use client'

import { useState, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListChecks,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Baseline,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'

interface ToolbarProps {
  editor: Editor | null
}

interface BtnDef {
  icon: React.ReactNode
  label: string
  action: () => void
  isActive: boolean
  separator?: boolean
}

function ColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentColor = editor.getAttributes('textStyle').color as string | undefined

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Font colour"
        className={cn(
          'p-2 md:p-1.5 rounded-md transition-colors flex flex-col items-center gap-0.5',
          open ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
        )}
      >
        <Baseline size={14} />
        <div
          className="w-3.5 h-1 rounded-sm"
          style={{ backgroundColor: currentColor ?? 'currentColor' }}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 flex flex-wrap gap-1.5 w-[130px]">
          {/* Reset to default */}
          <button
            onClick={() => { editor.chain().focus().unsetColor().run(); setOpen(false) }}
            title="Default"
            className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-text-primary)] hover:scale-110 transition-transform"
          />
          {PROJECT_COLORS.map(color => (
            <button
              key={color}
              onClick={() => { editor.chain().focus().setColor(color).run(); setOpen(false) }}
              title={color}
              style={{ backgroundColor: color }}
              className={cn(
                'w-6 h-6 rounded-full hover:scale-110 transition-transform',
                currentColor === color && 'ring-2 ring-offset-1 ring-[var(--color-text-primary)]'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const MOBILE_HIDDEN = new Set(['Underline', 'Strike', 'Inline code', 'Blockquote'])

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  const buttons: BtnDef[] = [
    {
      icon: <Heading1 size={14} />,
      label: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: <Heading2 size={14} />,
      label: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: <Heading3 size={14} />,
      label: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      separator: true,
    },
    {
      icon: <Bold size={14} />,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <Italic size={14} />,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: <Underline size={14} />,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <Strikethrough size={14} />,
      label: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      separator: true,
    },
    {
      icon: <Code size={14} />,
      label: 'Inline code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
    },
    {
      icon: <Quote size={14} />,
      label: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      separator: true,
    },
    {
      icon: <List size={14} />,
      label: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered size={14} />,
      label: 'Ordered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    {
      icon: <ListChecks size={14} />,
      label: 'Task list',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive('taskList'),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 md:py-1.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
      {buttons.map((btn, i) => (
        <div key={i} className={cn('flex items-center', MOBILE_HIDDEN.has(btn.label) && 'hidden md:flex')}>
          {btn.separator && (
            <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
          )}
          <button
            onClick={btn.action}
            title={btn.label}
            className={cn(
              'p-2 md:p-1.5 rounded-md transition-colors',
              btn.isActive
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {btn.icon}
          </button>
        </div>
      ))}
      <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
      <ColorPicker editor={editor} />
    </div>
  )
}
