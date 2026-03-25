// Samard's Recipe Finder - Main Application Script
// =================================================
// This app searches multiple recipe databases with automatic fallback:
// 1. Spoonacular (100k+ recipes) - requires API key
// 2. TheMealDB (~300 recipes) - free, no key

// Load API configuration from config.js
// IMPORTANT: Edit config.js to add your Spoonacular API key
document.write('<script src="config.js"><\/script>');

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryDropdown = document.getElementById('category-dropdown');
const resultsGrid = document.getElementById('results');
const hero = document.querySelector('.hero');
const logo = document.querySelector('.logo');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const mealDetails = document.getElementById('meal-details');

// Load categories on page load
document.addEventListener('DOMContentLoaded', loadCategories);

// Event listeners
searchBtn.addEventListener('click', searchByName);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByName();
    }
});
categoryDropdown.addEventListener('change', filterByCategory);
logo.addEventListener('click', resetToLanding);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Load categories for dropdown (TheMealDB only)
async function loadCategories() {
    try {
        const response = await fetch(`${API_CONFIG.themealdb.baseUrl}/list.php?c=list`);
        const data = await response.json();
        if (data.meals) {
            data.meals.forEach(category => {
                const option = document.createElement('option');
                option.value = category.strCategory;
                option.textContent = category.strCategory;
                categoryDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Reset to landing page
function resetToLanding() {
    hero.classList.remove('hidden');
    resultsGrid.innerHTML = '';
    searchInput.value = '';
    categoryDropdown.value = '';
}

// Current search state
let currentRecipes = [];
let currentProvider = null;

// Load categories on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

// Reset to landing page
function resetToLanding() {
    hero.classList.remove('hidden');
    resultsGrid.innerHTML = '';
    searchInput.value = '';
    categoryDropdown.value = '';
    currentRecipes = [];
    currentProvider = null;
}

// Search recipes by name - tries multiple providers with fallback
async function searchByName() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a meal name to search.');
        return;
    }

    resultsGrid.innerHTML = '<p class="loading">Searching recipe databases...</p>';
    hero.classList.add('hidden');

    // Try each provider in order until we get results
    for (const provider of SEARCH_PROVIDERS) {
        try {
            let recipes = null;

            if (provider === 'spoonacular') {
                recipes = await searchSpoonacular(query);
            } else if (provider === 'themealdb') {
                recipes = await searchTheMealDB(query);
            }

            if (recipes && recipes.length > 0) {
                currentRecipes = recipes;
                currentProvider = provider;
                displayRecipes(recipes);
                return;
            }
        } catch (error) {
            console.warn(`Search failed with ${provider}, trying next provider...`, error);
        }
    }

    // No results from any provider
    currentRecipes = [];
    currentProvider = null;
    displayRecipes(null);
    updateSourceIndicator();
}

// Filter recipes by category (TheMealDB only)
async function filterByCategory() {
    const category = categoryDropdown.value;
    if (!category) {
        resultsGrid.innerHTML = '';
        hero.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.themealdb.baseUrl}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await response.json();
        if (data.meals) {
            currentRecipes = data.meals.map(meal => ({
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                source: 'themealdb'
            }));
            currentProvider = 'themealdb';
            displayRecipes(currentRecipes);
        }
    } catch (error) {
        console.error('Error filtering recipes:', error);
        resultsGrid.innerHTML = '<p>Error loading recipes. Please try again.</p>';
    }
}

// Display recipes in grid
function displayRecipes(meals) {
    resultsGrid.innerHTML = '';
    if (!meals) {
        resultsGrid.innerHTML = `
            <p class="no-results">
                No recipes found. Try searching for common meals or different spellings.
                <br><br>
                Current: Using TheMealDB (limited ~300 recipes)
            </p>
        `;
        hero.classList.add('hidden');
        return;
    }

    hero.classList.add('hidden');
    meals.forEach(meal => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${meal.image}" alt="${meal.title}">
            <h3>${meal.title}</h3>
            ${meal.readyInMinutes ? `<p class="recipe-meta">⏱ ${meal.readyInMinutes} min</p>` : ''}
            ${meal.servings ? `<p class="recipe-meta">🍽 ${meal.servings} servings</p>` : ''}
        `;
        recipeCard.addEventListener('click', () => loadRecipeDetails(meal));
        resultsGrid.appendChild(recipeCard);
    });
}

// Search Spoonacular API (100,000+ recipes)
async function searchSpoonacular(query) {
    const url = `${API_CONFIG.spoonacular.baseUrl}/complexSearch?query=${encodeURIComponent(query)}&number=18&apiKey=${API_CONFIG.spoonacular.key}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Spoonacular API error');

    const data = await response.json();
    if (data.results) {
        return data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            source: 'spoonacular',
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            sourceUrl: recipe.sourceUrl
        }));
    }
    return null;
}

// Search TheMealDB API (~300 recipes, no API key required)
async function searchTheMealDB(query) {
    const url = `${API_CONFIG.themealdb.baseUrl}/search.php?s=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    const data = await response.json();
    if (data.meals) {
        return data.meals.map(meal => ({
            id: meal.idMeal,
            title: meal.strMeal,
            image: meal.strMealThumb,
            source: 'themealdb',
            category: meal.strCategory,
            area: meal.strArea,
            tags: meal.strTags
        }));
    }
    return null;
}

// Load full recipe details
async function loadRecipeDetails(recipe) {
    modal.style.display = 'block';
    mealDetails.innerHTML = '<p>Loading recipe details...</p>';

    try {
        if (recipe.source === 'spoonacular') {
            await loadSpoonacularDetails(recipe.id);
        } else if (recipe.source === 'themealdb') {
            await loadTheMealDBDetails(recipe.id);
        }
    } catch (error) {
        console.error('Error loading recipe details:', error);
        mealDetails.innerHTML = '<p>Error loading recipe details. Please try again.</p>';
    }
}

// Load Spoonacular recipe details
async function loadSpoonacularDetails(recipeId) {
    const url = `${API_CONFIG.spoonacular.baseUrl}/${recipeId}/information?apiKey=${API_CONFIG.spoonacular.key}`;

    const response = await fetch(url);
    const data = await response.json();

    displayRecipeDetails({
        title: data.title,
        image: data.image,
        ingredients: data.extendedIngredients.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`),
        instructions: data.instructions || 'No instructions available.',
        servings: data.servings,
        readyInMinutes: data.readyInMinutes,
        sourceUrl: data.sourceUrl
    });
}

// Load TheMealDB recipe details
async function loadTheMealDBDetails(mealId) {
    const url = `${API_CONFIG.themealdb.baseUrl}/lookup.php?i=${mealId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.meals && data.meals[0]) {
        const meal = data.meals[0];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure} ${ingredient}`);
            }
        }

        displayRecipeDetails({
            title: meal.strMeal,
            image: meal.strMealThumb,
            ingredients: ingredients,
            instructions: meal.strInstructions,
            category: meal.strCategory,
            area: meal.strArea,
            tags: meal.strTags,
            sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`
        });
    }
}

// Display recipe details in modal
function displayRecipeDetails(meal) {
    mealDetails.innerHTML = `
        <img src="${meal.image}" alt="${meal.title}">
        <h2>${meal.title}</h2>
        ${meal.category ? `<p class="recipe-info">Category: ${meal.category}</p>` : ''}
        ${meal.area ? `<p class="recipe-info">Cuisine: ${meal.area}</p>` : ''}
        ${meal.readyInMinutes ? `<p class="recipe-info">⏱ Ready in: ${meal.readyInMinutes} minutes</p>` : ''}
        ${meal.servings ? `<p class="recipe-info">🍽 Servings: ${meal.servings}</p>` : ''}
        <h3>Ingredients:</h3>
        <ul>
            ${meal.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h3>Instructions:</h3>
        <p>${meal.instructions.replace(/\r\n/g, '<br>')}</p>
        ${meal.sourceUrl ? `<p><a href="${meal.sourceUrl}" target="_blank" class="source-link">View original recipe →</a></p>` : ''}
    `;
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}