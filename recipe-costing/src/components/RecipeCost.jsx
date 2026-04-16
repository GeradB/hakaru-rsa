export default function RecipeCost({ recipe, ingredients, calculateCost, onBack }) {
  const totalCost = calculateCost(recipe);
  const costPerServing = totalCost / recipe.servings;

  const getIngredientName = (id) => {
    const ing = ingredients.find((i) => i.id === id);
    return ing ? ing.name : 'Unknown';
  };

  const getIngredientCost = (ingredientId, quantity) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return 0;
    const recipeQty = quantity;
    const purchaseQty = ing.purchaseQuantity;
    return (recipeQty / purchaseQty) * ing.purchasePrice;
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-rsa-gold hover:text-yellow-600 mb-6 font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Recipes
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-rsa-navy text-white px-6 py-4">
          <h2 className="text-2xl font-bold font-heading">{recipe.name}</h2>
          <p className="text-gray-300">Makes {recipe.servings} servings</p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ingredients Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingredient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recipe.ingredients.map((item, index) => {
                  const cost = getIngredientCost(item.ingredientId, item.quantity);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {getIngredientName(item.ingredientId)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        ${cost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-4 py-3 text-right font-bold text-gray-800">
                    Total Cost:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rsa-gold text-lg">
                    ${totalCost.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" className="px-4 py-3 text-right font-bold text-gray-800">
                    Cost Per Serving:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rsa-gold text-lg">
                    ${costPerServing.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-1">Total Recipe Cost</p>
          <p className="text-3xl font-bold text-rsa-gold">${totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-1">Cost Per Serving</p>
          <p className="text-3xl font-bold text-rsa-gold">${costPerServing.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 text-sm mb-1">Number of Servings</p>
          <p className="text-3xl font-bold text-gray-800">{recipe.servings}</p>
        </div>
      </div>
    </div>
  );
}
