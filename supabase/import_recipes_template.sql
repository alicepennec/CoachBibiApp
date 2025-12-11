-- Template pour ajouter des recettes
-- Remplacer les valeurs entre crochets [VALEUR]
-- Pour les ingrédients et les étapes, respectez le format JSON indiqué.

INSERT INTO public.recipes (
    title,
    category,       -- 'petit-dejeuner', 'dejeuner', 'gouter', 'diner'
    description,
    prep_time_minutes,
    servings,
    difficulty,     -- 'facile', 'moyen', 'difficile'
    ingredients,    -- Format JSON
    steps,          -- Format JSON
    calories,
    protein_g,
    carbs_g,
    fat_g,
    is_vegetarian,
    is_vegan,
    is_gluten_free,
    is_quick,       -- true si < 30 min
    created_by_coach_id -- ID du coach (optionnel si fait via l'admin)
) VALUES 
(
    'Titre de la recette',              -- Title
    'dejeuner',                         -- Category
    'Une délicieuse recette...',        -- Description
    20,                                 -- Prep time
    4,                                  -- Servings
    'facile',                           -- Difficulty
    
    -- Ingrédients (JSON)
    '[
        {"name": "Tomates", "quantity": "2 pièces"},
        {"name": "Huile d''olive", "quantity": "1 c.à.s"},
        {"name": "Sel", "quantity": "1 pincée"}
    ]'::jsonb,

    -- Étapes (JSON)
    '[
        "Laver les tomates.",
        "Couper en dés.",
        "Assaisonner et servir."
    ]'::jsonb,

    350, -- Calories
    15,  -- Proteines
    40,  -- Glucides
    10,  -- Lipides
    true,   -- Végétarien
    false,  -- Vegan
    true,   -- Sans gluten
    true,   -- Rapide
    auth.uid() -- Utilise l'ID de l'utilisateur connecté (si exécuté depuis l'interface Supabase)
);
