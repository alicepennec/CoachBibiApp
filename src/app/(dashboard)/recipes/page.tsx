"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { RecipeCard } from "@/components/features/recipes/recipe-card"
import { useAuth } from "@/hooks/use-auth"

export default function RecipesPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [recipes, setRecipes] = useState<any[]>([])
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("all")
    const [diet, setDiet] = useState("all")

    useEffect(() => {
        const fetchRecipes = async () => {
            let query = supabase.from("recipes").select("*").eq("is_active", true)

            const { data, error } = await query
            if (data) setRecipes(data)

            if (user) {
                const { data: favs } = await supabase
                    .from("favorite_recipes")
                    .select("recipe_id")
                    .eq("user_id", user.id)

                if (favs) {
                    setFavorites(new Set(favs.map(f => f.recipe_id)))
                }
            }

            setLoading(false)
        }

        fetchRecipes()
    }, [user])

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase()) ||
            recipe.description?.toLowerCase().includes(search.toLowerCase())

        const matchesCategory = category === "all" ||
            (category === "favorites" ? favorites.has(recipe.id) : recipe.category === category)

        let matchesDiet = true
        if (diet === "vegetarian") matchesDiet = recipe.is_vegetarian
        if (diet === "vegan") matchesDiet = recipe.is_vegan
        if (diet === "gluten-free") matchesDiet = recipe.is_gluten_free
        if (diet === "quick") matchesDiet = recipe.is_quick

        return matchesSearch && matchesCategory && matchesDiet
    })

    const handleToggleFavorite = (recipeId: string) => {
        setFavorites(prev => {
            const next = new Set(prev)
            if (next.has(recipeId)) {
                next.delete(recipeId)
            } else {
                next.add(recipeId)
            }
            return next
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Vos Recettes Saines</h1>
                <p className="text-muted-foreground">
                    Découvrez et sauvegardez vos recettes préférées.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une recette..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <Button
                            variant={diet === "all" ? "default" : "outline"}
                            onClick={() => setDiet("all")}
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={diet === "vegetarian" ? "default" : "outline"}
                            onClick={() => setDiet("vegetarian")}
                            size="sm"
                        >
                            Végétarien
                        </Button>
                        <Button
                            variant={diet === "vegan" ? "default" : "outline"}
                            onClick={() => setDiet("vegan")}
                            size="sm"
                        >
                            Vegan
                        </Button>
                        <Button
                            variant={diet === "gluten-free" ? "default" : "outline"}
                            onClick={() => setDiet("gluten-free")}
                            size="sm"
                        >
                            Sans gluten
                        </Button>
                        <Button
                            variant={diet === "quick" ? "default" : "outline"}
                            onClick={() => setDiet("quick")}
                            size="sm"
                        >
                            Rapide
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="all" onValueChange={setCategory}>
                    <TabsList>
                        <TabsTrigger value="all">Toutes</TabsTrigger>
                        <TabsTrigger value="petit-dejeuner">Petit-déjeuner</TabsTrigger>
                        <TabsTrigger value="dejeuner">Déjeuner</TabsTrigger>
                        <TabsTrigger value="gouter">Goûter</TabsTrigger>
                        <TabsTrigger value="diner">Dîner</TabsTrigger>
                        <TabsTrigger value="favorites">Favoris</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-[300px] bg-slate-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Aucune recette trouvée.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isFavorite={favorites.has(recipe.id)}
                            onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
