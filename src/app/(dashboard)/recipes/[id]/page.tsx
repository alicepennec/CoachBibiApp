import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Clock, Users, Flame, Heart, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { RecipeActions } from "@/components/features/recipes/recipe-actions"

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: recipe } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!recipe) {
        notFound()
    }

    let isFavorite = false
    let personalNotes = ""

    if (user) {
        const { data: fav } = await supabase
            .from("favorite_recipes")
            .select("*")
            .eq("user_id", user.id)
            .eq("recipe_id", recipe.id)
            .single()

        if (fav) {
            isFavorite = true
            personalNotes = fav.personal_notes || ""
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center space-x-4">
                <Link href="/recipes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Retour aux recettes</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="aspect-video w-full bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                        {recipe.image_url ? (
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                <span className="text-6xl">🍽️</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-sm px-3 py-1 capitalize">{recipe.category}</Badge>
                        {recipe.is_quick && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Rapide</Badge>}
                        {recipe.is_vegetarian && <Badge variant="outline">Végétarien</Badge>}
                        {recipe.is_vegan && <Badge variant="outline">Vegan</Badge>}
                        {recipe.is_gluten_free && <Badge variant="outline">Sans gluten</Badge>}
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-xl border shadow-sm">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Clock className="h-5 w-5 text-primary mb-1" />
                            <span className="text-sm font-medium">{recipe.prep_time_minutes} min</span>
                            <span className="text-xs text-muted-foreground">Préparation</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center border-l border-r">
                            <Users className="h-5 w-5 text-primary mb-1" />
                            <span className="text-sm font-medium">{recipe.servings} pers.</span>
                            <span className="text-xs text-muted-foreground">Portions</span>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                            <Flame className="h-5 w-5 text-primary mb-1" />
                            <span className="text-sm font-medium">{recipe.calories}</span>
                            <span className="text-xs text-muted-foreground">Calories</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-red-500" />
                            Notes personnelles
                        </h3>
                        <RecipeActions
                            recipeId={recipe.id}
                            initialIsFavorite={isFavorite}
                            initialNotes={personalNotes}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {recipe.description}
                        </p>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
                        <ul className="space-y-3">
                            {recipe.ingredients.map((ingredient: any, index: number) => (
                                <li key={index} className="flex items-start">
                                    <span className="h-2 w-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                                    <span className="text-slate-700">
                                        <span className="font-medium">{ingredient.quantity}</span> {ingredient.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Préparation</h2>
                        <div className="space-y-6">
                            {recipe.steps.map((step: string, index: number) => (
                                <div key={index} className="flex">
                                    <div className="flex-shrink-0 mr-4">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <p className="text-slate-700 mt-1 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Informations nutritionnelles</h2>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-sm font-medium text-slate-500">Protéines</div>
                                <div className="text-lg font-bold text-slate-900">{recipe.protein_g}g</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-sm font-medium text-slate-500">Glucides</div>
                                <div className="text-lg font-bold text-slate-900">{recipe.carbs_g}g</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-sm font-medium text-slate-500">Lipides</div>
                                <div className="text-lg font-bold text-slate-900">{recipe.fat_g}g</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
