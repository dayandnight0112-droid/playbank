/**
 * marketplaceService.js (Player Store)
 * Reads published reward product catalog from Supabase.
 * Enforces that players can ONLY read published snapshot data (status = 'published').
 */

import { supabase, isSupabaseConfigured } from './supabase.js'
import { mockDb } from './mockDb.js'

/**
 * Maps raw database product record to player UI product format
 */
function mapToPlayerProduct(p) {
  const bpPrice = p.published_bp_price ?? p.bp_price ?? 800
  const name = p.published_name || p.name || 'Reward Product'
  const description = p.published_description || p.description || ''
  const imageUrl = p.published_image_url || p.image_url || ''

  // Infer pleasant icon type for fallback
  let iconType = 'book'
  const lower = name.toLowerCase()
  if (lower.includes('lamp') || lower.includes('light')) {
    iconType = 'lamp'
  } else if (lower.includes('bottle') || lower.includes('water')) {
    iconType = 'droplet'
  } else if (lower.includes('exam') || lower.includes('booster') || lower.includes('rocket')) {
    iconType = 'rocket'
  }

  return {
    id: p.id,
    name,
    description: description || 'High-quality reward item redeemable with PlayBank Points.',
    bp_price: bpPrice,
    cash_price: p.cash_price ?? Math.max(10, Math.round(bpPrice / 50)),
    stock: p.stock ?? 999,
    image_url: imageUrl,
    icon_type: p.icon_type || iconType,
    tnc: p.tnc || '1. Only redeemable within Malaysia.\n2. Delivery takes 3-5 working days.\n3. Non-refundable once redeemed.',
    published_at: p.published_at,
  }
}

/**
 * Fetch published products for Player Marketplace
 * Queries the published snapshot view or active published rows.
 */
export async function fetchPublishedProducts() {
  if (!isSupabaseConfigured || !supabase) {
    console.info('[marketplaceService] Supabase not configured, using fallback catalog')
    return mockDb.getProducts()
  }

  try {
    // 1. Try dedicated published_marketplace_products view first
    const { data: viewData, error: viewError } = await supabase
      .from('published_marketplace_products')
      .select('*')
      .order('published_at', { ascending: false })

    if (!viewError && Array.isArray(viewData) && viewData.length > 0) {
      return viewData.map(mapToPlayerProduct)
    }

    // 2. Fallback query to marketplace_products where status = 'published'
    const { data: tblData, error: tblError } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (!tblError && Array.isArray(tblData) && tblData.length > 0) {
      return tblData.map(mapToPlayerProduct)
    }

    // 3. Fallback to mockDb if remote table has no published items yet
    return mockDb.getProducts()
  } catch (err) {
    console.warn('[marketplaceService] Error fetching published products, using fallback:', err.message)
    return mockDb.getProducts()
  }
}
