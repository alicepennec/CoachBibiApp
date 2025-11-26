"use client"

import { useState } from "react"
import { Heart, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

interface RecipeActionsProps {
    recipeId: string
    initialIsFavorite: boolean
    initialNotes: string
}

export function RecipeActions({ recipeId, initialIsFavorite, initialNotes }: RecipeActionsProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [notes, setNotes] = useState(initialNotes)
    const [loading, setLoading] = useState(false)
    const [savingNotes, setSavingNotes] = useState(false)

    const handleToggleFavorite = async () => {
        if (!user) return
        setLoading(true)

        try {
            if (isFavorite) {
                // If we remove from favorites, we also lose the notes if we delete the row
                // But usually we want to keep notes? The DB schema says UNIQUE(user_id, recipe_id)
                // So if we delete the row, we lose notes.
                // Let's assume removing from favorites deletes the row.
                const { error } = await supabase
                    .from("favorite_recipes")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("recipe_id", recipeId)

                if (error) throw error
                setIsFavorite(false)
                setNotes("") // Clear notes as row is gone
                toast.success("Retiré des favoris")
            } else {
                const { error } = await supabase
                    .from("favorite_recipes")
                    .insert({
                        user_id: user.id,
                        recipe_id: recipeId,
                        personal_notes: notes
                    })

                if (error) throw error
                setIsFavorite(true)
                toast.success("Ajouté aux favoris")
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNotes = async () => {
        if (!user) return
        if (!isFavorite) {
            toast.error("Ajoutez d'abord la recette aux favoris pour sauvegarder des notes")
            return
        }

        setSavingNotes(true)
        try {
            const { error } = await supabase
                .from("favorite_recipes")
                .update({ personal_notes: notes })
                .eq("user_id", user.id)
                .eq("recipe_id", recipeId)

            if (error) throw error
            toast.success("Notes sauvegardées")
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setSavingNotes(false)
        }
    }

    return (
        <div className="space-y-4">
            <Button
                variant={isFavorite ? "secondary" : "outline"}
                className="w-full justify-start"
                onClick={handleToggleFavorite}
                disabled={loading}
            >
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                )}
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </Button>

            <div className="space-y-2">
                <Textarea
                    placeholder="Ajoutez vos notes personnelles ici..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] resize-none"
                    disabled={!isFavorite}
                />
                <Button
                    size="sm"
                    className="w-full"
                    onClick={handleSaveNotes}
                    disabled={!isFavorite || savingNotes}
                >
                    {savingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les notes
                </Button>
            </div>
        </div>
    )
}
