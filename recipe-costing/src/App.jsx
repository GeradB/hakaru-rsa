import { useState, useEffect } from 'react';
import { initialData } from './data';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import RecipeCost from './components/RecipeCost';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Load data from localStorage or use initial data
  const [ingredients, setIngredients] = useState(() => {
    const saved = localStorage.getItem('recipeCosting_ingredients');
    return saved ? JSON.parse(saved) : initialData.ingredients;
  });

  const [recipes, setRecipes] = useState(() => {
    const saved = localStorage.getItem('recipeCosting_recipes');
    return saved ? JSON.parse(saved) : initialData.recipes;
  });

  // Unit conversion to base units (g, ml)
  const toBaseUnit = (quantity, unit) => {
    switch (unit) {
      case 'kg': return quantity * 1000;
      case 'L': return quantity * 1000;
      default: return quantity;
    }
  };

  // Calculate cost for a given quantity in recipe units
  const getIngredientCost = (ingredient, quantity, unit) => {
    const recipeQty = toBaseUnit(quantity, unit);
    const purchaseQty = toBaseUnit(ingredient.purchaseQuantity, ingredient.purchaseUnit);
    return (recipeQty / purchaseQty) * ingredient.purchasePrice;
  };

  // Calculate recipe cost
  const calculateRecipeCost = (recipe) => {
    let totalCost = 0;
    recipe.ingredients.forEach((item) => {
      const ingredient = ingredients.find((i) => i.id === item.ingredientId);
      if (ingredient) {
        totalCost += getIngredientCost(ingredient, item.quantity, item.unit);
      }
    });
    return totalCost;
  };

  const addIngredient = (ingredient) => {
    setIngredients([...ingredients, { ...ingredient, id: Date.now() }]);
  };

  const updateIngredient = (id, updates) => {
    setIngredients(ingredients.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteIngredient = (id) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const addRecipe = (recipe) => {
    setRecipes([...recipes, { ...recipe, id: Date.now() }]);
  };

  const updateRecipe = (id, updates) => {
    setRecipes(recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  // Reset data to initial state
  const resetData = () => {
    if (window.confirm('This will delete all your custom recipes and ingredients and restore the defaults. Are you sure?')) {
      setIngredients(initialData.ingredients);
      setRecipes(initialData.recipes);
    }
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('recipeCosting_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('recipeCosting_recipes', JSON.stringify(recipes));
  }, [recipes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-rsa-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="w-12 h-12 bg-rsa-gold rounded-full flex items-center justify-center">
                <span className="text-rsa-navy font-bold text-xl">RSA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading">Meal Mate</h1>
                <p className="text-xs text-gray-300">Calculate meal costs from bulk ingredients</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-4" aria-label="Main navigation">
            <button
              onClick={() => { setActiveTab('ingredients'); setSelectedRecipe(null); }}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'ingredients'
                  ? 'border-rsa-gold text-rsa-navy'
                  : 'border-transparent text-gray-500 hover:text-rsa-navy'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => { setActiveTab('recipes'); setSelectedRecipe(null); }}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'recipes'
                  ? 'border-rsa-gold text-rsa-navy'
                  : 'border-transparent text-gray-500 hover:text-rsa-navy'
              }`}
            >
              Recipes
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'ingredients' && (
          <Ingredients
            ingredients={ingredients}
            onAdd={addIngredient}
            onUpdate={updateIngredient}
            onDelete={deleteIngredient}
          />
        )}

        {activeTab === 'recipes' && !selectedRecipe && (
          <Recipes
            recipes={recipes}
            ingredients={ingredients}
            calculateCost={calculateRecipeCost}
            onAdd={addRecipe}
            onUpdate={updateRecipe}
            onDelete={deleteRecipe}
            onViewDetails={setSelectedRecipe}
          />
        )}

        {activeTab === 'recipes' && selectedRecipe && (
          <RecipeCost
            recipe={selectedRecipe}
            ingredients={ingredients}
            calculateCost={calculateRecipeCost}
            onBack={() => setSelectedRecipe(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
