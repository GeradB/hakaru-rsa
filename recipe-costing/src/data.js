// ============================================
// RECIPE COSTING APP DATA
// Edit ingredients and recipes here
// ============================================

export const initialData = {
  // Bulk ingredients purchased (what you buy from the store)
  ingredients: [
    {
      id: 1,
      name: "Chicken Breast",
      purchaseUnit: "kg",
      purchasePrice: 12.99,
      purchaseQuantity: 1,
    },
    {
      id: 2,
      name: "Rice",
      purchaseUnit: "kg",
      purchasePrice: 4.50,
      purchaseQuantity: 1,
    },
    {
      id: 3,
      name: "Olive Oil",
      purchaseUnit: "L",
      purchasePrice: 8.99,
      purchaseQuantity: 1,
    },
    {
      id: 4,
      name: "Onions",
      purchaseUnit: "kg",
      purchasePrice: 2.50,
      purchaseQuantity: 1,
    },
    {
      id: 5,
      name: "Garlic",
      purchaseUnit: "bulb",
      purchasePrice: 0.80,
      purchaseQuantity: 1,
    },
    {
      id: 6,
      name: "Cream",
      purchaseUnit: "L",
      purchasePrice: 3.50,
      purchaseQuantity: 1,
    },
    {
      id: 7,
      name: "Parmesan Cheese",
      purchaseUnit: "g",
      purchasePrice: 0.05,
      purchaseQuantity: 1,
    },
    {
      id: 8,
      name: "Eggs",
      purchaseUnit: "dozen",
      purchasePrice: 6.50,
      purchaseQuantity: 1,
    },
    {
      id: 9,
      name: "Flour",
      purchaseUnit: "kg",
      purchasePrice: 2.00,
      purchaseQuantity: 1,
    },
    {
      id: 10,
      name: "Butter",
      purchaseUnit: "g",
      purchasePrice: 0.03,
      purchaseQuantity: 1,
    },
  ],

  // Recipes with ingredients used
  recipes: [
    {
      id: 1,
      name: "Chicken Alfredo Pasta",
      servings: 4,
      ingredients: [
        { ingredientId: 1, quantity: 400, unit: "g" },
        { ingredientId: 2, quantity: 300, unit: "g" },
        { ingredientId: 3, quantity: 30, unit: "ml" },
        { ingredientId: 4, quantity: 100, unit: "g" },
        { ingredientId: 5, quantity: 2, unit: "clove" },
        { ingredientId: 6, quantity: 200, unit: "ml" },
        { ingredientId: 7, quantity: 50, unit: "g" },
      ],
    },
    {
      id: 2,
      name: "Garlic Butter Chicken",
      servings: 2,
      ingredients: [
        { ingredientId: 1, quantity: 300, unit: "g" },
        { ingredientId: 5, quantity: 4, unit: "clove" },
        { ingredientId: 10, quantity: 50, unit: "g" },
        { ingredientId: 3, quantity: 20, unit: "ml" },
      ],
    },
    {
      id: 3,
      name: "Creamy Rice",
      servings: 4,
      ingredients: [
        { ingredientId: 2, quantity: 200, unit: "g" },
        { ingredientId: 6, quantity: 150, unit: "ml" },
        { ingredientId: 10, quantity: 30, unit: "g" },
        { ingredientId: 7, quantity: 30, unit: "g" },
      ],
    },
  ],
};
