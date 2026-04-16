import { useState } from 'react';

export default function Ingredients({ ingredients, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    purchaseUnit: 'kg',
    purchasePrice: '',
    purchaseQuantity: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...newIngredient,
      purchasePrice: parseFloat(newIngredient.purchasePrice),
      purchaseQuantity: parseFloat(newIngredient.purchaseQuantity),
    });
    setNewIngredient({ name: '', purchaseUnit: 'kg', purchasePrice: '', purchaseQuantity: '' });
    setShowForm(false);
  };

  const costPerUnit = (ingredient) => {
    return (ingredient.purchasePrice / ingredient.purchaseQuantity).toFixed(4);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-rsa-navy font-heading">Bulk Ingredients</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-rsa-gold text-rsa-navy px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ Add Ingredient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">New Ingredient</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold focus:border-green-500"
                placeholder="e.g., Chicken Breast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Unit</label>
              <select
                value={newIngredient.purchaseUnit}
                onChange={(e) => setNewIngredient({ ...newIngredient, purchaseUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="dozen">dozen</option>
                <option value="unit">unit</option>
                <option value="bulb">bulb</option>
                <option value="clove">clove</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newIngredient.purchasePrice}
                onChange={(e) => setNewIngredient({ ...newIngredient, purchasePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Purchased</label>
              <input
                type="number"
                step="0.01"
                required
                value={newIngredient.purchaseQuantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, purchaseQuantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rsa-gold"
                placeholder="1"
              />
            </div>
          </div>
          <button type="submit" className="bg-rsa-gold text-rsa-navy px-6 py-2 rounded-lg hover:bg-yellow-600 font-medium">
            Add Ingredient
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost per Unit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{ingredient.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  ${ingredient.purchasePrice.toFixed(2)} / {ingredient.purchaseUnit}
                </td>
                <td className="px-6 py-4 text-gray-600">{ingredient.purchaseQuantity} {ingredient.purchaseUnit}</td>
                <td className="px-6 py-4 text-rsa-gold font-bold">
                  ${costPerUnit(ingredient)} / {ingredient.purchaseUnit}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(ingredient.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ingredients.length === 0 && (
          <p className="text-center text-gray-500 py-8">No ingredients added yet. Click "Add Ingredient" to start.</p>
        )}
      </div>
    </div>
  );
}
