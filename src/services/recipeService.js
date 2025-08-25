import axios from 'axios';

// Recipe API configuration (using Spoonacular API as an example)
const RECIPE_API_URL = 'https://api.spoonacular.com/recipes';
const RECIPE_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY; // You'll need to set this

export class RecipeService {
  static async generateRecipes(ingredients, maxRecipes = 5) {
    try {
      // Extract ingredient names for API query
      const ingredientNames = ingredients.map(ing => ing.name).join(',');
      
      // Get recipes based on ingredients
      const response = await axios.get(`${RECIPE_API_URL}/findByIngredients`, {
        params: {
          apiKey: RECIPE_API_KEY,
          ingredients: ingredientNames,
          number: maxRecipes,
          ranking: 2, // Maximize used ingredients
          ignorePantry: true
        }
      });

      // Enhance recipes with detailed information
      const enhancedRecipes = await Promise.all(
        response.data.map(async (recipe) => {
          try {
            const detailResponse = await axios.get(`${RECIPE_API_URL}/${recipe.id}/information`, {
              params: { apiKey: RECIPE_API_KEY }
            });
            
            return this.processRecipeData(recipe, detailResponse.data, ingredients);
          } catch (error) {
            console.error(`Failed to get details for recipe ${recipe.id}:`, error);
            return this.processRecipeData(recipe, null, ingredients);
          }
        })
      );

      return enhancedRecipes.filter(recipe => recipe !== null);
    } catch (error) {
      console.error('Recipe API Error:', error);
      // Fallback to AI-generated recipes if API fails
      return this.generateFallbackRecipes(ingredients, maxRecipes);
    }
  }

  static processRecipeData(basicRecipe, detailedRecipe, detectedIngredients) {
    const recipe = {
      id: basicRecipe.id,
      title: basicRecipe.title,
      image: basicRecipe.image,
      usedIngredients: basicRecipe.usedIngredients || [],
      missedIngredients: basicRecipe.missedIngredients || [],
      confidence: this.calculateRecipeConfidence(basicRecipe, detectedIngredients)
    };

    if (detailedRecipe) {
      recipe.instructions = detailedRecipe.instructions;
      recipe.readyInMinutes = detailedRecipe.readyInMinutes;
      recipe.servings = detailedRecipe.servings;
      recipe.cuisine = detailedRecipe.cuisines?.[0] || 'International';
      recipe.diet = detailedRecipe.diets?.[0] || 'General';
      recipe.nutrition = detailedRecipe.nutrition;
    }

    return recipe;
  }

  static calculateRecipeConfidence(recipe, detectedIngredients) {
    if (!recipe.usedIngredients || detectedIngredients.length === 0) {
      return 0.5; // Default confidence
    }

    const usedCount = recipe.usedIngredients.length;
    const totalDetected = detectedIngredients.length;
    const matchRatio = usedCount / totalDetected;
    
    // Higher confidence for recipes that use more detected ingredients
    return Math.min(matchRatio * 1.5, 1.0);
  }

  static generateFallbackRecipes(ingredients, maxRecipes = 3) {
    // AI-generated recipe suggestions when API is unavailable
    const fallbackRecipes = [];
    const ingredientNames = ingredients.map(ing => ing.name);
    
    // Simple recipe generation based on ingredient combinations
    const recipeTemplates = [
      {
        title: `${ingredientNames[0]} Salad`,
        description: `A fresh salad featuring ${ingredientNames[0]} and other fresh ingredients`,
        difficulty: 'Easy',
        time: '15 minutes',
        confidence: 0.8
      },
      {
        title: `${ingredientNames[0]} Stir Fry`,
        description: `Quick stir fry with ${ingredientNames[0]} and vegetables`,
        difficulty: 'Medium',
        time: '25 minutes',
        confidence: 0.7
      },
      {
        title: `${ingredientNames[0]} Soup`,
        description: `Hearty soup made with ${ingredientNames[0]} and broth`,
        difficulty: 'Easy',
        time: '30 minutes',
        confidence: 0.6
      }
    ];

    // Generate recipes based on available ingredients
    for (let i = 0; i < Math.min(maxRecipes, recipeTemplates.length); i++) {
      const template = recipeTemplates[i];
      fallbackRecipes.push({
        id: `fallback-${i}`,
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        time: template.time,
        confidence: template.confidence,
        isFallback: true,
        ingredients: ingredientNames.slice(0, 3) // Use first 3 ingredients
      });
    }

    return fallbackRecipes;
  }

  static async getRecipeInstructions(recipeId) {
    try {
      const response = await axios.get(`${RECIPE_API_URL}/${recipeId}/analyzedInstructions`, {
        params: { apiKey: RECIPE_API_KEY }
      });
      
      return response.data[0]?.steps?.map(step => step.step) || [];
    } catch (error) {
      console.error('Failed to get recipe instructions:', error);
      return [];
    }
  }

  static categorizeRecipes(recipes) {
    const categories = {
      quick: recipes.filter(r => r.readyInMinutes && r.readyInMinutes <= 30),
      healthy: recipes.filter(r => r.diet && ['vegetarian', 'vegan', 'gluten-free'].includes(r.diet)),
      popular: recipes.filter(r => r.confidence > 0.8),
      all: recipes
    };

    return categories;
  }
}
