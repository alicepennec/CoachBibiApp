"use client"

import Link from "next/link"
import { Clock, Users, Flame, Heart } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface RecipeCardProps {
    recipe: any
    isFavorite?: boolean
    onToggleFavorite?: () => void
}

export function RecipeCard({ recipe, isFavorite = false, onToggleFavorite }: RecipeCardProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [favorite, setFavorite] = useState(isFavorite)

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) return

        setLoading(true)
        // Optimistic update
        setFavorite(!favorite)

        try {
            if (favorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from("favorite_recipes")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("recipe_id", recipe.id)

                if (error) throw error
                toast.success("Retiré des favoris")
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from("favorite_recipes")
                    .insert({
                        user_id: user.id,
                        recipe_id: recipe.id
                    })

                if (error) throw error
                toast.success("Ajouté aux favoris")
            }

            if (onToggleFavorite) onToggleFavorite()
        } catch (error) {
            toast.error("Erreur lors de la mise à jour des favoris")
            setFavorite(!favorite) // Revert
        } finally {
            setLoading(false)
        }
    }

    return (
        <Link href={`/recipes/${recipe.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
                <div className="aspect-video w-full bg-slate-100 relative">
                    {recipe.image_url ? (
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <span className="text-4xl">🍽️</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8"
                        onClick={handleFavorite}
                        disabled={loading}
                    >
                        <Heart className={`h-5 w-5 ${favorite ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
                    </Button>
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2 capitalize">{recipe.category}</Badge>
                        {recipe.is_quick && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Rapide</Badge>}
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {recipe.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {recipe.prep_time_minutes} min
                        </div>
                        <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {recipe.servings} pers.
                        </div>
                        <div className="flex items-center">
                            <Flame className="w-3 h-3 mr-1" />
                            {recipe.calories} kcal
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-1">
                    {recipe.is_vegetarian && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">Végétarien</Badge>}
                    {recipe.is_vegan && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">Vegan</Badge>}
                    {recipe.is_gluten_free && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">Sans gluten</Badge>}
                </CardFooter>
            </Card>
        </Link>
    )
}
