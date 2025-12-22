import foodJollof from '@/assets/food-jollof.jpg';
import foodSuya from '@/assets/food-suya.jpg';
import drinkPalm from '@/assets/drink-palm.jpg';
import foodEgusi from '@/assets/food-egusi.jpg';
import foodPlantain from '@/assets/food-plantain.jpg';
import { MenuItem } from '@/types/menu';

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
  },
];

export const categories = ['All', 'Starters', 'Mains', 'Sides', 'Drinks'];
