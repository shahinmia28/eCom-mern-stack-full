import express from 'express';
import {
  allCategory,
  createCategory,
  deleteCategory,
  singleCategory,
  updateCategory,
} from '../controllers/categoryController.js';
import { isAdmin, requiredSignIn } from '../middleware/authMiddleware.js';
const categoryRouter = express.Router();

// create category
categoryRouter.post('/create', createCategory);

//getALl category
categoryRouter.get('/get-all', allCategory);

//single category
categoryRouter.get('/get-single/:slug', singleCategory);

//update category
categoryRouter.put('/update/:id', updateCategory);

//delete category
categoryRouter.delete('/delete/:id', deleteCategory);

export default categoryRouter;
