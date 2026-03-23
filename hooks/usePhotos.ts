'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Photo {
  name: string
  url: string
  created_at: string
}

export const PHOTOS_LIMIT = 10

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [archivedPhotos, setArchivedPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const [activeRes, archivedRes] = await Promise.all([
        supabase.storage.from('photos').list('', { sortBy: { column: 'created_at', order: 'desc' } }),
        supabase.storage.from('photos').list('archived', { sortBy: { column: 'created_at', order: 'desc' } }),
      ])
      if (activeRes.data) {
        setPhotos(activeRes.data.map(f => ({
          name: f.name,
          url: supabase.storage.from('photos').getPublicUrl(f.name).data.publicUrl,
          created_at: f.created_at ?? '',
        })))
      }
      if (archivedRes.data) {
        setArchivedPhotos(archivedRes.data.map(f => ({
          name: f.name,
          url: supabase.storage.from('photos').getPublicUrl(`archived/${f.name}`).data.publicUrl,
          created_at: f.created_at ?? '',
        })))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPhotos() }, [loadPhotos])

  useEffect(() => {
    function handleFocus() { loadPhotos() }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadPhotos])

  const uploadPhoto = useCallback(async (files: FileList) => {
    if (photos.length >= PHOTOS_LIMIT) return
    setUploading(true)
    try {
      const slots = PHOTOS_LIMIT - photos.length
      const toUpload = Array.from(files).slice(0, slots)
      await Promise.all(
        toUpload.map(async file => {
          const ext = file.name.split('.').pop()
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          await supabase.storage.from('photos').upload(path, file)
        })
      )
      await loadPhotos()
    } finally {
      setUploading(false)
    }
  }, [loadPhotos, photos.length])

  const archivePhoto = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from('photos').move(name, `archived/${name}`)
    if (error) { console.error('Failed to archive photo:', error); return }
    setPhotos(prev => {
      const photo = prev.find(p => p.name === name)
      if (photo) {
        setArchivedPhotos(a => [{
          name: photo.name,
          url: supabase.storage.from('photos').getPublicUrl(`archived/${name}`).data.publicUrl,
          created_at: photo.created_at,
        }, ...a])
      }
      return prev.filter(p => p.name !== name)
    })
    setSelectedPhoto(prev => prev?.name === name ? null : prev)
  }, [])

  const restorePhoto = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from('photos').move(`archived/${name}`, name)
    if (error) { console.error('Failed to restore photo:', error); return }
    setArchivedPhotos(prev => {
      const photo = prev.find(p => p.name === name)
      if (photo) {
        setPhotos(a => [{
          name: photo.name,
          url: supabase.storage.from('photos').getPublicUrl(name).data.publicUrl,
          created_at: photo.created_at,
        }, ...a])
      }
      return prev.filter(p => p.name !== name)
    })
  }, [])

  const permanentDeletePhoto = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from('photos').remove([`archived/${name}`])
    if (error) { console.error('Failed to permanently delete photo:', error); return }
    setArchivedPhotos(prev => prev.filter(p => p.name !== name))
  }, [])

  const deletePhoto = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from('photos').remove([name])
    if (error) { console.error('Failed to delete photo:', error); return }
    setPhotos(prev => prev.filter(p => p.name !== name))
    setSelectedPhoto(prev => prev?.name === name ? null : prev)
  }, [])

  return {
    photos,
    archivedPhotos,
    loading,
    uploading,
    selectedPhoto,
    setSelectedPhoto,
    uploadPhoto,
    archivePhoto,
    restorePhoto,
    permanentDeletePhoto,
    deletePhoto,
  }
}
