import { useState } from 'react';

export default function Recipes({ recipes, ingredients, calculateCost, onAdd, onUpdate, onDelete, onViewDetails }) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    servings: '',
    ingredients: [],
  });

  const addRecipeIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { ingredientId: '', quantity: '', unit: 'g' }],
    });
  };

  const updateRecipeIngredient = (index, field, value) => {
    const updated = [...newRecipe.ingredients];
    if (field === 'ingredientId') {
      updated[index] = { ...updated[index], ingredientId: value ? parseInt(value) : '' };
    } else if (field === 'quantity') {
      updated[index] = { ...updated[index], quantity: parseFloat(value) || '' };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setNewRecipe({ ...newRecipe, ingredients: updated });
  };

  const removeRecipeIngredient = (index) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index),
    });
  };

  const startEdit = (recipe) => {
    setEditingRecipe(recipe.id);
    setNewRecipe({
      name: recipe.name,
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients.map(i => ({ ...i })),
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingRecipe(null);
    setNewRecipe({ name: '', servings: '', ingredients: [] });
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipeData = {
      ...newRecipe,
      servings: parseInt(newRecipe.servings),
      ingredients: newRecipe.ingredients.filter((i) => i.ingredientId),
    };
    if (editingRecipe) {
      onUpdate(editingRecipe, recipeData);
      setEditingRecipe(null);
    } else {
      onAdd(recipeData);
    }
    setNewRecipe({ name: '', servings: '', ingredients: [] });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-rsa-navy font-heading">Recipes</h2>
        <button
          onClick={() => showForm ? cancelEdit() : setShowForm(true)}
          className="bg-rsa-gold text-rsa-navy px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Recipe'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">{editingRecipe ? 'Edit Recipe' : 'New Recipe'}</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
              <input
                type="text"
                required
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
                placeholder="e.g., Chicken Alfredo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input
                type="number"
                required
                min="1"
                value={newRecipe.servings}
                onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
                placeholder="4"
              />
            </div>
          </div>

          <h4 className="font-medium text-gray-700 mb-2">Ingredients</h4>
          {newRecipe.ingredients.map((item, index) => (
            <div key={index} className="grid md:grid-cols-4 gap-2 mb-2">
              <select
                value={item.ingredientId}
                onChange={(e) => updateRecipeIngredient(index, 'ingredientId', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
              >
                <option value="">Select ingredient</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.purchaseUnit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateRecipeIngredient(index, 'quantity', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
                placeholder="Amount"
              />
              <select
                value={item.unit}
                onChange={(e) => updateRecipeIngredient(index, 'unit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="unit">unit</option>
                <option value="clove">clove</option>
              </select>
              <button
                type="button"
                onClick={() => removeRecipeIngredient(index)}
                className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                title="Remove ingredient"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={addRecipeIngredient}
              className="bg-rsa-gold text-rsa-navy px-4 py-2 rounded-lg hover:bg-yellow-600 font-medium"
            >
              + Add Ingredient
            </button>

            <button type="submit" className="bg-rsa-gold text-rsa-navy px-6 py-2 rounded-lg hover:bg-yellow-600 font-medium">
              {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const totalCost = calculateCost(recipe);
          const costPerServing = totalCost / recipe.servings;
          return (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className="bg-rsa-navy text-white px-4 py-3 cursor-pointer"
                onClick={() => onViewDetails(recipe)}
              >
                <h3 className="font-bold text-lg font-heading">{recipe.name}</h3>
              </div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Servings:</span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Ingredients:</span>
                  <span className="font-medium">{recipe.ingredients.length}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-bold text-rsa-gold">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per Serving:</span>
                    <span className="font-bold text-rsa-gold">${costPerServing.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewDetails(recipe); }}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(recipe); }}
                    className="flex-1 bg-rsa-gold text-rsa-navy px-3 py-2 rounded hover:bg-yellow-600 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {recipes.length === 0 && (
        <p className="text-center text-gray-500 py-8">No recipes yet. Click "Add Recipe" to create one.</p>
      )}
    </div>
  );
}
