'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PROJECT_COLORS } from '@/lib/constants'
import type { VaultItem } from '@/types'

export function useVaultItems() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lengthRef = useRef(0)
  lengthRef.current = vaultItems.length
  const vaultItemsRef = useRef<VaultItem[]>([])
  vaultItemsRef.current = vaultItems

  useEffect(() => {
    supabase
      .from('vault_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setVaultItems(data ?? [])
        setLoading(false)
      }, (err: { message?: string }) => {
        setError(err?.message ?? 'Failed to load vault items')
        setLoading(false)
      })
  }, [])

  const createVaultItem = useCallback(async (name: string): Promise<VaultItem | null> => {
    const usedColors = new Set(vaultItemsRef.current.map(v => v.color))
    const color =
      PROJECT_COLORS.find(c => !usedColors.has(c)) ??
      PROJECT_COLORS[lengthRef.current % PROJECT_COLORS.length]
    const sort_order = lengthRef.current
    const { data, error } = await supabase
      .from('vault_items')
      .insert({ name, color, sort_order })
      .select()
      .single()
    if (error || !data) return null
    setVaultItems(prev => [...prev, data])
    return data
  }, [])

  const updateVaultItem = useCallback(async (id: string, color: string) => {
    setVaultItems(prev => prev.map(v => v.id === id ? { ...v, color } : v))
    await supabase.from('vault_items').update({ color }).eq('id', id)
  }, [])

  const renameVaultItem = useCallback(async (id: string, name: string) => {
    setVaultItems(prev => prev.map(v => v.id === id ? { ...v, name } : v))
    await supabase.from('vault_items').update({ name }).eq('id', id)
  }, [])

  const reorderVaultItems = useCallback(async (reordered: VaultItem[]) => {
    setVaultItems(reordered)
    await Promise.all(
      reordered.map((v, i) =>
        supabase.from('vault_items').update({ sort_order: i }).eq('id', v.id)
      )
    )
  }, [])

  return { vaultItems, loading, error, createVaultItem, updateVaultItem, renameVaultItem, reorderVaultItems }
}
