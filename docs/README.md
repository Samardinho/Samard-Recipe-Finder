# Samard's Recipe Finder Web App

A web app that searches multiple recipe databases (Spoonacular, RecipePuppy, TheMealDB) to find any recipe.

## Features

- Search recipes by name
- Filter recipes by category
- View detailed recipe information including ingredients and instructions
- Responsive design that works on desktop and mobile devices

## How to Use

1. Open `index.html` in your web browser
2. Enter a meal name in the search bar and click "Search" or press Enter
3. Alternatively, select a category from the dropdown to filter recipes
4. Click on any recipe card to view full details in a modal
5. Close the modal by clicking the X or clicking outside the modal

## Files

- `index.html`: The main HTML structure
- `style.css`: CSS styles for layout and design
- `script.js`: JavaScript for API calls and interactivity

## API

This app uses TheMealDB API (https://www.themealdb.com/api.php) which requires no API key. Note that TheMealDB has a limited database of recipes, primarily featuring Western and some international dishes. It may not include recipes from all cuisines or regions.


## Troubleshooting

| Issue | Solution |
|-------|----------|
| No recipes found | Try different spellings or add your Spoonacular API key |
| App won't load | Check browser console (F12), ensure all files are in same folder |
| CORS errors | Verify internet connection, check API endpoints |
| Missing config.js | Run: `cp config.example.js config.js` then add your API key |


Built with vanilla HTML, CSS, and JavaScript. No frameworks required!!
