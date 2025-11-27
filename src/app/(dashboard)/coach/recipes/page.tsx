"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { RecipeForm } from "@/components/features/recipes/recipe-form"
import { toast } from "sonner"

export default function RecipeManagementPage() {
    const supabase = createClient()
    const [recipes, setRecipes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<any | null>(null)

    const fetchRecipes = async () => {
        const { data } = await supabase
            .from("recipes")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setRecipes(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette recette ?")) return

        const { error } = await supabase.from("recipes").delete().eq("id", id)
        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Recette supprimée")
            fetchRecipes()
        }
    }

    const handleEdit = (recipe: any) => {
        setEditingRecipe(recipe)
        setIsDialogOpen(true)
    }

    const handleSaved = () => {
        setIsDialogOpen(false)
        setEditingRecipe(null)
        fetchRecipes()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gestion des Recettes</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingRecipe(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Nouvelle Recette
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingRecipe ? "Modifier la recette" : "Créer une recette"}</DialogTitle>
                        </DialogHeader>
                        <RecipeForm
                            recipe={editingRecipe}
                            onSaved={handleSaved}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des recettes ({recipes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Titre</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Calories</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Chargement...</TableCell>
                                </TableRow>
                            ) : recipes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">Aucune recette</TableCell>
                                </TableRow>
                            ) : (
                                recipes.map((recipe) => (
                                    <TableRow key={recipe.id}>
                                        <TableCell className="font-medium">{recipe.title}</TableCell>
                                        <TableCell className="capitalize">{recipe.category}</TableCell>
                                        <TableCell>{recipe.calories} kcal</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(recipe)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(recipe.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
