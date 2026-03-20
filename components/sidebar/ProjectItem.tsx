'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectItemProps {
  project: Project
  isActive: boolean
  onSelect: (id: string) => void
}

export function ProjectItem({ project, isActive, onSelect }: ProjectItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  const bgColor = isActive
    ? `${project.color}2E`
    : isHovered
    ? `${project.color}1F`
    : `${project.color}14`

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: bgColor,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(project.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center px-3 py-2 rounded-lg cursor-pointer select-none transition-colors',
        isDragging && 'opacity-40 shadow-lg'
      )}
    >
      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
        {project.name || 'Untitled project'}
      </span>
    </div>
  )
}
