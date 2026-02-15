import express from 'express';
import { getRestaurants, getRestaurant, getCategories } from '../controllers/restaurantsController.js';

const router = express.Router();

// Public routes - no authentication required
// Get all restaurants with search/filters
router.get('/', getRestaurants);

// Get categories list
router.get('/categories', getCategories);

// Get single restaurant with menu
router.get('/:id', getRestaurant);

export default router;
