export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    api: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string
                    email: string
                    phone: string | null
                    date_of_birth: string | null
                    profile_picture_url: string | null
                    role: 'client' | 'coach'
                    current_weight: number | null
                    goal_weight: number | null
                    height: number | null
                    is_vegetarian: boolean
                    is_vegan: boolean
                    is_gluten_free: boolean
                    is_lactose_free: boolean
                    dietary_notes: string | null
                    email_notifications: boolean
                    daily_reminders: boolean
                    dark_mode: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    email: string
                    phone?: string | null
                    date_of_birth?: string | null
                    profile_picture_url?: string | null
                    role?: 'client' | 'coach'
                    current_weight?: number | null
                    goal_weight?: number | null
                    height?: number | null
                    is_vegetarian?: boolean
                    is_vegan?: boolean
                    is_gluten_free?: boolean
                    is_lactose_free?: boolean
                    dietary_notes?: string | null
                    email_notifications?: boolean
                    daily_reminders?: boolean
                    dark_mode?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    date_of_birth?: string | null
                    profile_picture_url?: string | null
                    role?: 'client' | 'coach'
                    current_weight?: number | null
                    goal_weight?: number | null
                    height?: number | null
                    is_vegetarian?: boolean
                    is_vegan?: boolean
                    is_gluten_free?: boolean
                    is_lactose_free?: boolean
                    dietary_notes?: string | null
                    email_notifications?: boolean
                    daily_reminders?: boolean
                    dark_mode?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            weight_entries: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    weight_kg: number
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    weight_kg: number
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    weight_kg?: number
                    notes?: string | null
                    created_at?: string
                }
            }
            measurements: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    chest_cm: number | null
                    waist_cm: number | null
                    belly_cm: number | null
                    hips_cm: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    chest_cm?: number | null
                    waist_cm?: number | null
                    belly_cm?: number | null
                    hips_cm?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    chest_cm?: number | null
                    waist_cm?: number | null
                    belly_cm?: number | null
                    hips_cm?: number | null
                    created_at?: string
                }
            }
            sleep_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    hours_slept: number
                    quality_rating: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    hours_slept: number
                    quality_rating?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    hours_slept?: number
                    quality_rating?: number | null
                    notes?: string | null
                    created_at?: string
                }
            }
            mood_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    mood_rating: number | null
                    mood_word: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    mood_rating?: number | null
                    mood_word?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    mood_rating?: number | null
                    mood_word?: string | null
                    created_at?: string
                }
            }
            daily_checklist: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    water_check: boolean
                    hunger_check: boolean
                    breathing_check: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    water_check?: boolean
                    hunger_check?: boolean
                    breathing_check?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    water_check?: boolean
                    hunger_check?: boolean
                    breathing_check?: boolean
                    created_at?: string
                }
            }
            coherence_sessions: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    duration_minutes: number
                    completed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    duration_minutes: number
                    completed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    duration_minutes?: number
                    completed?: boolean
                    created_at?: string
                }
            }
            recipes: {
                Row: {
                    id: string
                    title: string
                    category: string
                    description: string | null
                    prep_time_minutes: number | null
                    cook_time_minutes: number | null
                    servings: number | null
                    difficulty: string | null
                    ingredients: Json
                    steps: Json
                    calories: number | null
                    protein_g: number | null
                    carbs_g: number | null
                    fat_g: number | null
                    is_vegetarian: boolean
                    is_vegan: boolean
                    is_gluten_free: boolean
                    is_quick: boolean
                    image_url: string | null
                    created_by_coach_id: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    category: string
                    description?: string | null
                    prep_time_minutes?: number | null
                    cook_time_minutes?: number | null
                    servings?: number | null
                    difficulty?: string | null
                    ingredients: Json
                    steps: Json
                    calories?: number | null
                    protein_g?: number | null
                    carbs_g?: number | null
                    fat_g?: number | null
                    is_vegetarian?: boolean
                    is_vegan?: boolean
                    is_gluten_free?: boolean
                    is_quick?: boolean
                    image_url?: string | null
                    created_by_coach_id?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    category?: string
                    description?: string | null
                    prep_time_minutes?: number | null
                    cook_time_minutes?: number | null
                    servings?: number | null
                    difficulty?: string | null
                    ingredients?: Json
                    steps?: Json
                    calories?: number | null
                    protein_g?: number | null
                    carbs_g?: number | null
                    fat_g?: number | null
                    is_vegetarian?: boolean
                    is_vegan?: boolean
                    is_gluten_free?: boolean
                    is_quick?: boolean
                    image_url?: string | null
                    created_by_coach_id?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            favorite_recipes: {
                Row: {
                    id: string
                    user_id: string
                    recipe_id: string
                    personal_notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    recipe_id: string
                    personal_notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    recipe_id?: string
                    personal_notes?: string | null
                    created_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    category: 'nutrition' | 'sport' | 'bien-etre' | 'autre' | null
                    status: 'a-commencer' | 'en-cours' | 'consolidation' | 'acquis' | null
                    order_position: number | null
                    is_from_predefined: boolean
                    predefined_goal_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    category?: 'nutrition' | 'sport' | 'bien-etre' | 'autre' | null
                    status?: 'a-commencer' | 'en-cours' | 'consolidation' | 'acquis' | null
                    order_position?: number | null
                    is_from_predefined?: boolean
                    predefined_goal_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    category?: 'nutrition' | 'sport' | 'bien-etre' | 'autre' | null
                    status?: 'a-commencer' | 'en-cours' | 'consolidation' | 'acquis' | null
                    order_position?: number | null
                    is_from_predefined?: boolean
                    predefined_goal_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            predefined_goals: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    category: string | null
                    created_by_coach_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    category?: string | null
                    created_by_coach_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    category?: string | null
                    created_by_coach_id?: string | null
                    created_at?: string
                }
            }
            coach_notes: {
                Row: {
                    id: string
                    coach_id: string
                    client_id: string
                    note_text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    coach_id: string
                    client_id: string
                    note_text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    coach_id?: string
                    client_id?: string
                    note_text?: string
                    created_at?: string
                }
            }
        }
    }
}
