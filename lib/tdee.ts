export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Goal = 'lose' | 'maintain' | 'gain'
export type Gender = 'male' | 'female'

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}

// Mifflin-St Jeor formula
export function calculateBMR(params: {
  weight_kg: number
  height_cm: number
  age: number
  gender: Gender
}): number {
  const { weight_kg, height_cm, age, gender } = params
  const base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
  return Math.round(gender === 'male' ? base + 5 : base - 161)
}

export function calculateTDEE(bmr: number, activity_level: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activity_level])
}

// Calorie targets adjusted from TDEE based on goal
export function getCalorieTarget(tdee: number, goal: Goal): number {
  if (goal === 'lose') return tdee - 500  // ~0.5 kg/week deficit
  if (goal === 'gain') return tdee + 300  // steady lean bulk
  return tdee
}
