'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex-shrink-0">
      {buttons.map((btn, i) => (
        <div key={i} className="flex items-center">
          {btn.separator && (
            <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
          )}
          <button
            onClick={btn.action}
            title={btn.label}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              btn.isActive
                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {btn.icon}
          </button>
        </div>
      ))}
    </div>
  )
}
