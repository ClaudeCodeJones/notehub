'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PROJECT_COLORS } from '@/lib/constants'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lengthRef = useRef(0)
  lengthRef.current = projects.length
  const projectsRef = useRef<Project[]>([])
  projectsRef.current = projects

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProjects(data ?? [])
        setLoading(false)
      })
  }, [])

  const createProject = useCallback(async (name: string): Promise<Project | null> => {
    const usedColors = new Set(projectsRef.current.map(p => p.color))
    const color =
      PROJECT_COLORS.find(c => !usedColors.has(c)) ??
      PROJECT_COLORS[lengthRef.current % PROJECT_COLORS.length]
    const sort_order = lengthRef.current
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, sort_order })
      .select()
      .single()
    if (error || !data) return null
    setProjects(prev => [...prev, data])
    return data
  }, [])

  const reorderProjects = useCallback(async (reordered: Project[]) => {
    setProjects(reordered)
    await Promise.all(
      reordered.map((p, i) =>
        supabase.from('projects').update({ sort_order: i }).eq('id', p.id)
      )
    )
  }, [])

  const updateProject = useCallback(async (id: string, color: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, color } : p))
    await supabase.from('projects').update({ color }).eq('id', id)
  }, [])

  const renameProject = useCallback(async (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    await supabase.from('projects').update({ name }).eq('id', id)
  }, [])

  const updateFromRealtime = useCallback((updated: Project) => {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)))
  }, [])

  const insertFromRealtime = useCallback((inserted: Project) => {
    setProjects(prev => {
      if (prev.some(p => p.id === inserted.id)) return prev
      return [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order)
    })
  }, [])

  const deleteFromRealtime = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    renameProject,
    reorderProjects,
    updateFromRealtime,
    insertFromRealtime,
    deleteFromRealtime,
  }
}
