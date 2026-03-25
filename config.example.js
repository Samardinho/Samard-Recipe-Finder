// Samard's Recipe Finder - Configuration Example
// ===============================================
// IMPORTANT: Copy this file to 'config.js' and replace placeholders with your actual API keys
// NEVER commit config.js to version control - it will be in your .gitignore automatically

/*
 * For Local Development:
 * 1. Copy this file: cp config.example.js config.js
 * 2. Add your API key to the new config.js file
 * 3. config.js is automatically excluded from git (see .gitignore)
 */

const API_CONFIG = {
    spoonacular: {
        // Your Spoonacular API key (150 free requests/day)
        // Get your free key at: https://spoonacular.com/food-api
        key: 'your_api_key_here',  // REPLACE THIS WITH YOUR ACTUAL KEY
        baseUrl: 'https://api.spoonacular.com/recipes'
    },
    recipepuppy: {
        // Free API - no key required
        // Indexes recipes from various cooking websites
        baseUrl: 'http://www.recipepuppy.com/api'
    },
    themealdb: {
        // Free API - no key required
        // Limited database (~300 recipes) but reliable fallback
        baseUrl: 'https://www.themealdb.com/api/json/v1/1'
    }
};

// Search providers in order of preference (largest database first)
// 1. Spoonacular: 100,000+ recipes (requires API key)
// 2. RecipePuppy: ~10,000 recipes (free, no key)
// 3. TheMealDB: ~300 recipes (free, no key, used as fallback)
const SEARCH_PROVIDERS = ['spoonacular', 'recipepuppy', 'themealdb'];
