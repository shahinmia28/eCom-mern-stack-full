import express from 'express';
import {
  CancelOrderByUser,
  OrderCheckout,
  createProduct,
  deleteProduct,
  getImage,
  getProducts,
  getSingleProduct,
  orderCheckoutWithoutPayment,
  paymentFail,
  paymentSuccess,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  relatedProductController,
  searchProductController,
  updateProduct,
  uploadImage,
} from '../controllers/productController.js';
import { isAdmin, requiredSignIn } from '../middleware/authMiddleware.js';
import upload from '../helpers/multer.js';

const productRouter = express.Router();

//create product
productRouter.post(
  '/create',
  upload.array('image'),
  requiredSignIn,
  createProduct
);

//get all products
productRouter.get('/get-all', getProducts);

//single product
productRouter.get('/get-single/:slug', getSingleProduct);

//update product
productRouter.put(
  '/update/:pid',
  upload.array('image'),
  requiredSignIn,
  updateProduct
);

//delete product
productRouter.delete('/delete/:pid', requiredSignIn, deleteProduct);

//filter product
productRouter.post('/product-filters', productFiltersController);

//product count
productRouter.get('/product-count', productCountController);

//product per page
productRouter.get('/product-list/:page', productListController);

//product per search
productRouter.get('/search/:keyword', searchProductController);

//similar product
productRouter.get('/related-product/:pid/:cid', relatedProductController);

//category wise product
productRouter.get('/product-category/:slug', productCategoryController);

// order cancel by user
productRouter.delete('/cancel-order/:_id', CancelOrderByUser);

// //payments routes
productRouter.post('/order-checkout', requiredSignIn, OrderCheckout);

// Check out without payment || cash on delivery
productRouter.post(
  '/order-checkout-without-payment',
  requiredSignIn,
  orderCheckoutWithoutPayment
);

productRouter.post('/payment/success/:trx_id', paymentSuccess);
productRouter.post('/payment/fail/:trx_id', paymentFail);

// img uploader test
productRouter.post('/create-img', upload.array('image'), uploadImage);
productRouter.get('/get-img', getImage);
export default productRouter;
