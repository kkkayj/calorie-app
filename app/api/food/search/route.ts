import { NextRequest } from 'next/server'
import { searchLocalFoods } from '@/lib/local-foods'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return Response.json({ foods: [] })

  // Local Malaysian/Asian foods — shown first
  const local = searchLocalFoods(q).map(f => ({
    name:      f.name,
    calories:  f.calories,
    protein_g: f.protein_g,
    carbs_g:   f.carbs_g,
    fat_g:     f.fat_g,
    serving:   f.serving,
  }))

  // USDA database — fill remaining slots
  const slotsLeft = 8 - local.length
  let usda: typeof local = []

  if (slotsLeft > 0) {
    try {
      const key = process.env.USDA_API_KEY || 'DEMO_KEY'
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=${key}&pageSize=${slotsLeft}&dataType=SR%20Legacy,Foundation`
      const res  = await fetch(url, { next: { revalidate: 3600 } })
      const data = await res.json()

      type RawNutrient = { nutrientId: number; value: number }
      type RawFood     = { description: string; foodNutrients: RawNutrient[] }

      usda = (data.foods ?? [])
        .map((f: RawFood) => {
          const get = (id: number) => f.foodNutrients.find(n => n.nutrientId === id)?.value ?? 0
          return {
            name:      f.description,
            calories:  Math.round(get(1008)),
            protein_g: Math.round(get(1003) * 10) / 10,
            carbs_g:   Math.round(get(1005) * 10) / 10,
            fat_g:     Math.round(get(1004) * 10) / 10,
            serving:   'per 100g',
          }
        })
        .filter((f: { calories: number }) => f.calories > 0)
    } catch {
      // USDA unavailable — local results still returned
    }
  }

  return Response.json({ foods: [...local, ...usda] })
}
