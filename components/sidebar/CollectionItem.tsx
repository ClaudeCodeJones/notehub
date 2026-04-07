'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'
import type { BookmarkCollection } from '@/types'

interface CollectionItemProps {
  collection: BookmarkCollection
  isActive: boolean
  onSelect: (id: string) => void
  onUpdateColor: (color: string) => void
  onRename: (name: string) => void
}

export function CollectionItem({ collection, isActive, onSelect, onUpdateColor, onRename }: CollectionItemProps) {
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(collection.name)
  const [renameInPicker, setRenameInPicker] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRenameRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: collection.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor: isActive
      ? 'var(--color-bg-tertiary)'
      : isHovered
      ? 'var(--color-bg-secondary)'
      : 'transparent',
  }

  function openPicker(x: number, y: number) {
    setRenameInPicker(collection.name)
    setPickerPos({ x, y })
    setShowPicker(true)
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    openPicker(e.clientX, e.clientY)
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    longPressTimer.current = setTimeout(() => {
      openPicker(touch.clientX, touch.clientY)
    }, 500)
  }

  function handleTouchEnd() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  function handlePickSwatch(e: React.MouseEvent, color: string) {
    e.stopPropagation()
    onUpdateColor(color)
    setShowPicker(false)
  }

  function handlePickerRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = renameInPicker.trim()
      if (trimmed && trimmed !== collection.name) onRename(trimmed)
      setShowPicker(false)
    }
    if (e.key === 'Escape') setShowPicker(false)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setEditName(collection.name)
    setIsEditing(true)
  }

  function handleRenameSave() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== collection.name) onRename(trimmed)
    setIsEditing(false)
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); handleRenameSave() }
    if (e.key === 'Escape') { setEditName(collection.name); setIsEditing(false) }
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (showPicker) {
      setTimeout(() => pickerRenameRef.current?.focus(), 50)
    }
  }, [showPicker])

  useEffect(() => {
    if (!showPicker) return
    function handleOutside() { setShowPicker(false) }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showPicker])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    return () => { if (longPressTimer.current) clearTimeout(longPressTimer.current) }
  }, [])

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(isEditing ? {} : listeners)}
        onClick={isEditing ? undefined : () => onSelect(collection.id)}
        onDoubleClick={isEditing ? undefined : handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={isEditing ? undefined : handleContextMenu}
        onTouchStart={isEditing ? undefined : handleTouchStart}
        onTouchEnd={isEditing ? undefined : handleTouchEnd}
        onTouchMove={isEditing ? undefined : handleTouchEnd}
        className={cn(
          'flex items-center gap-2 h-10 md:h-8 px-3 rounded-lg select-none transition-colors overflow-hidden',
          isEditing ? 'cursor-text' : 'cursor-pointer'
        )}
      >
        <Bookmark size={14} className="flex-shrink-0" style={{ color: collection.color }} />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSave}
            onPointerDown={e => e.stopPropagation()}
            className="w-full text-sm bg-transparent outline-none border-none text-[var(--color-text-primary)]"
          />
        ) : (
          <span className={cn('text-base md:text-sm truncate text-[var(--color-text-primary)]', isActive && 'font-semibold')}>
            {collection.name}
          </span>
        )}
      </div>

      {showPicker && mounted && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{ position: 'fixed', top: pickerPos.y + 8, left: pickerPos.x + 8, zIndex: 9999 }}
          className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg shadow-lg p-2 flex flex-col gap-2 w-[148px]"
        >
          <input
            ref={pickerRenameRef}
            type="text"
            value={renameInPicker}
            onChange={e => setRenameInPicker(e.target.value)}
            onKeyDown={handlePickerRenameKeyDown}
            placeholder="Rename…"
            className="w-full text-sm bg-[var(--color-bg-secondary)] outline-none border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          <div className="grid grid-cols-5 gap-1">
            {PROJECT_COLORS.map(color => (
              <button
                key={color}
                onClick={e => handlePickSwatch(e, color)}
                style={{ backgroundColor: color, width: 24, height: 24, borderRadius: '50%' }}
                className={cn(
                  'flex-shrink-0 transition-transform hover:scale-110',
                  collection.color === color && 'ring-2 ring-offset-1 ring-[var(--color-text-primary)]'
                )}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
