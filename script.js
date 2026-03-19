// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryDropdown = document.getElementById('category-dropdown');
const resultsGrid = document.getElementById('results');
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const mealDetails = document.getElementById('meal-details');

// API base URL
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

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
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/list.php?c=list`);
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

// Search recipes by name
async function searchByName() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a meal name to search.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error searching recipes:', error);
        resultsGrid.innerHTML = '<p>Error loading recipes. Please try again.</p>';
    }
}

// Filter recipes by category
async function filterByCategory() {
    const category = categoryDropdown.value;
    if (!category) {
        resultsGrid.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch (error) {
        console.error('Error filtering recipes:', error);
        resultsGrid.innerHTML = '<p>Error loading recipes. Please try again.</p>';
    }
}

// Display recipes in grid
function displayRecipes(meals) {
    resultsGrid.innerHTML = '';
    if (!meals) {
        resultsGrid.innerHTML = '<p>No recipes found. TheMealDB has a limited database of recipes. Try searching for common meals, different spellings, or check <a href="https://www.themealdb.com/api.php" target="_blank">TheMealDB API</a> for available recipes.</p>';
        return;
    }

    meals.forEach(meal => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <h3>${meal.strMeal}</h3>
        `;
        recipeCard.addEventListener('click', () => loadMealDetails(meal.idMeal));
        resultsGrid.appendChild(recipeCard);
    });
}

// Load full meal details
async function loadMealDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE}/lookup.php?i=${mealId}`);
        const data = await response.json();
        if (data.meals && data.meals[0]) {
            const meal = data.meals[0];
            displayMealDetails(meal);
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading meal details:', error);
    }
}

// Display meal details in modal
function displayMealDetails(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure} ${ingredient}`);
        }
    }

    mealDetails.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h2>${meal.strMeal}</h2>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        <h3>Instructions:</h3>
        <p>${meal.strInstructions.replace(/\r\n/g, '<br>')}</p>
    `;
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
}