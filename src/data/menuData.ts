import foodJollof from '@/assets/food-jollof.jpg';
import foodSuya from '@/assets/food-suya.jpg';
import drinkPalm from '@/assets/drink-palm.jpg';
import foodEgusi from '@/assets/food-egusi.jpg';
import foodPlantain from '@/assets/food-plantain.jpg';
import { MenuItem, CustomizationOption } from '@/types/menu';

// Sample customization options
const suyaSpiceLevel: CustomizationOption = {
  id: 'spice_level',
  name: 'spice_level',
  label: 'Spice Level',
  choices: [
    { value: 'mild', label: 'Mild' },
    { value: 'medium', label: 'Medium' },
    { value: 'hot', label: 'Hot' },
    { value: 'extra_hot', label: 'Extra Hot 🔥' },
  ],
  required: true,
};

const meatCooking: CustomizationOption = {
  id: 'cooking',
  name: 'cooking',
  label: 'How would you like it?',
  choices: [
    { value: 'rare', label: 'Rare' },
    { value: 'medium_rare', label: 'Medium Rare' },
    { value: 'medium', label: 'Medium' },
    { value: 'medium_well', label: 'Medium Well' },
    { value: 'well_done', label: 'Well Done' },
  ],
  required: true,
};

const portionSize: CustomizationOption = {
  id: 'portion',
  name: 'portion',
  label: 'Portion Size',
  choices: [
    { value: 'regular', label: 'Regular' },
    { value: 'large', label: 'Large', priceModifier: 500 },
    { value: 'extra_large', label: 'Extra Large', priceModifier: 1000 },
  ],
  required: false,
};

const drinkSize: CustomizationOption = {
  id: 'size',
  name: 'size',
  label: 'Size',
  choices: [
    { value: 'small', label: 'Small' },
    { value: 'regular', label: 'Regular' },
    { value: 'large', label: 'Large', priceModifier: 300 },
  ],
  required: false,
};

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Jollof Rice Supreme',
    description: 'Smoky party-style jollof rice with tender beef and fried plantains',
    price: 4500,
    category: 'Mains',
    image: foodJollof,
    available: true,
    tags: ['popular', 'spicy'],
    allergens: ['gluten'],
    ingredients: ['rice', 'tomatoes', 'peppers', 'onions', 'beef', 'plantains', 'vegetable oil'],
    customizationOptions: [
      {
        id: 'protein',
        name: 'protein',
        label: 'Choose Protein',
        choices: [
          { value: 'beef', label: 'Beef' },
          { value: 'chicken', label: 'Chicken' },
          { value: 'fish', label: 'Fish', priceModifier: 500 },
          { value: 'goat', label: 'Goat Meat', priceModifier: 700 },
        ],
        required: true,
      },
      portionSize,
    ],
  },
  {
    id: '2',
    name: 'Suya Platter',
    description: 'Grilled beef skewers marinated in authentic suya spice, served with fresh onions',
    price: 3500,
    category: 'Starters',
    image: foodSuya,
    available: true,
    tags: ['spicy', 'grilled'],
    allergens: ['peanuts'],
    ingredients: ['beef', 'suya spice', 'peanuts', 'onions', 'tomatoes', 'cabbage'],
    customizationOptions: [suyaSpiceLevel, meatCooking],
  },
  {
    id: '3',
    name: 'Tropical Sunset',
    description: 'Refreshing palm wine cocktail with citrus notes and rosemary garnish',
    price: 2000,
    category: 'Drinks',
    image: drinkPalm,
    available: true,
    tags: ['alcoholic', 'refreshing'],
    allergens: [],
    ingredients: ['palm wine', 'orange juice', 'lime', 'rosemary', 'honey'],
    customizationOptions: [drinkSize],
  },
  {
    id: '4',
    name: 'Egusi Delight',
    description: 'Rich melon seed soup with assorted meat, served with pounded yam',
    price: 5500,
    category: 'Mains',
    image: foodEgusi,
    available: true,
    tags: ['traditional', 'hearty'],
    allergens: ['shellfish'],
    ingredients: ['egusi (melon seeds)', 'spinach', 'palm oil', 'stockfish', 'beef', 'assorted meat', 'crayfish'],
    customizationOptions: [
      {
        id: 'swallow',
        name: 'swallow',
        label: 'Choose Swallow',
        choices: [
          { value: 'pounded_yam', label: 'Pounded Yam' },
          { value: 'eba', label: 'Eba (Garri)' },
          { value: 'amala', label: 'Amala' },
          { value: 'semovita', label: 'Semovita' },
        ],
        required: true,
      },
      portionSize,
    ],
  },
  {
    id: '5',
    name: 'Dodo Platter',
    description: 'Perfectly fried ripe plantains, golden and crispy',
    price: 1500,
    category: 'Sides',
    image: foodPlantain,
    available: true,
    tags: ['vegetarian', 'sweet'],
    allergens: [],
    ingredients: ['ripe plantains', 'vegetable oil', 'salt'],
    customizationOptions: [portionSize],
  },
  {
    id: '6',
    name: 'Chapman Classic',
    description: 'Nigerian signature mocktail with Fanta, Sprite, and bitters',
    price: 1800,
    category: 'Drinks',
    image: drinkPalm,
    available: true,
    tags: ['non-alcoholic', 'refreshing'],
    allergens: [],
    ingredients: ['Fanta', 'Sprite', 'Angostura bitters', 'grenadine', 'cucumber', 'lime', 'orange slices'],
    customizationOptions: [drinkSize],
  },
];

export const categories = ['All', 'Starters', 'Mains', 'Sides', 'Drinks'];
