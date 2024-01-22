import Product from '../models/productSchema.js';
import fs from 'fs';
import slugify from 'slugify';
import Category from '../models/categoryModel.js';
import SSLCommerzPayment from 'sslcommerz-lts';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User2 from '../models/userModel2.js';
import cloudinary from '../helpers/cloudinary.js';
dotenv.config();

// create product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, quantity, shipping, color } =
      req.body;

    // Validation
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping ||
      !color
    ) {
      return res.status(500).send({ message: 'All fields are required' });
    }

    // Images File Handling
    const urls = [];
    const files = req.files;

    if (files.length !== 0) {
      for (const file of files) {
        const { path } = file;
        const result = await cloudinary.uploader.upload(path);
        const data = {
          url: result.secure_url,
          public_id: result.public_id,
        };
        urls.push(data);
        fs.unlinkSync(path);
      }
    } else {
      return res.status(500).send({ message: 'All fields are required' });
    }

    // Check if Product Already Exists
    const productExist = await Product.findOne({ name });
    if (productExist) {
      return res.status(502).send({
        message: 'Product Name is Already Exist. please try another Name',
      });
    }

    // Create New Product
    const product = new Product({
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      color,
      images: urls,
      slug: slugify(name),
    });

    await product.save();
    if (!product) {
      for (const url of urls) {
        const { public_id } = url;
        await cloudinary.uploader.destroy(public_id);
      }
    }

    res.status(201).send({
      success: true,
      message: 'Product Created Successfully',
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

//get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category')
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: 'All products get successfully ',
      products,
    });
  } catch (error) {
    console.log(error);
  }
};
// get single product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      'category'
    );
    res.status(200).send({
      success: true,
      message: 'Single Product is Fetched',
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

//delete controller
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.pid;
    const product = await Product.findById({ _id: id });

    for (const image of product.images) {
      const { public_id } = image;
      await cloudinary.uploader.destroy(public_id);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: 'Product Deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while deleting product',
      error,
    });
  }
};

//update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping, color } =
      req.body;
    const id = req.params.pid;
    // Validation
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping ||
      !color
    ) {
      return res.status(500).send({ message: 'All fields are required' });
    }

    const oldProduct = await Product.findById({ _id: id });

    const files = req.files;

    const urls = files.length !== 0 ? [] : oldProduct.images;

    if (files.length !== 0) {
      // delete old images
      for (const image of oldProduct.images) {
        const { public_id } = image;
        await cloudinary.uploader.destroy(public_id);
      }
      // urls = [];
      // set new images
      for (const file of files) {
        const { path } = file;
        const result = await cloudinary.uploader.upload(path);
        const data = {
          url: result.secure_url,
          public_id: result.public_id,
        };
        urls.push(data);
        fs.unlinkSync(path);
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        quantity,
        shipping,
        color,
        images: urls,
        slug: slugify(name),
      },
      { new: true }
    );

    await product.save();

    // if (!product) {
    //   for (const url of urls) {
    //     const { public_id } = url;
    //     await cloudinary.uploader.destroy(public_id);
    //   }
    // }

    res.status(201).send({
      success: true,
      message: 'Product Updated Successfully',
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, maxPrice, minPrice } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;

    if (minPrice > 0 || maxPrice > 0)
      args.price = { $gte: minPrice, $lte: maxPrice };

    const products = await Product.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error While Filtering Products',
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 30;
    const page = req.params.page ? req.params.page : 1;
    const products = await Product.find({})
      .select('-photo')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ],
    }).select('-photo');
    res.json(results);
  } catch (error) {
    console.log(error);
  }
};

// similar products
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await Product.find({
      category: cid,
      _id: { $ne: pid },
    })
      .select('-photo')
      .limit(6)
      .populate('category');
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

// get product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    const products = await Product.find({ category }).populate('category');
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

// order Checkout Without Payment
export const orderCheckoutWithoutPayment = async (req, res) => {
  try {
    const { product, user, totalPrice } = req.body;

    const finalOrder = {
      products: product,
      buyer: user._id,
      totalPrice: totalPrice,
      payment: false,
    };
    const result = await Order.create(finalOrder);

    // totalAmount: product.amount,
    res.status(200).send({
      success: true,
      message: 'Order Placed Successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(402).send({
      success: false,
      message: 'Something Wrong, Please Try again',
    });
  }
};

//payment gateway api
const store_id = process.env.SSLCOMMERCE_STORE_ID;
const store_passwd = process.env.SSLCOMMERCE_STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

export const OrderCheckout = async (req, res) => {
  try {
    const { product, user, totalPrice } = req.body;

    const trx_id = new mongoose.Types.ObjectId().toString();

    const data = {
      total_amount: totalPrice,
      currency: 'BDT',
      tran_id: trx_id, // use unique tran_id for each api call
      success_url: `${process.env.API_URL}/api/product/payment/success/${trx_id}`,
      fail_url: `${process.env.API_URL}/api/product/payment/fail/${trx_id}`,
      cancel_url: `${process.env.API_URL}`,
      ipn_url: `${process.env.API_URL}`,
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: user?.name,
      cus_email: user?.email,
      cus_add1: user?.address,
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: user?.phone,
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };
    // console.log(data);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then((apiResponse) => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.send({ url: GatewayPageURL });

      const finalOrder = {
        products: product,
        buyer: user._id,
        totalPrice: totalPrice,
        payment: false,
        transaction_id: trx_id,
      };
      const result = Order.create(finalOrder);
      // console.log('Redirecting to: ', GatewayPageURL);
    });
  } catch (error) {
    console.log(error);
  }
};

// Payment success
export const paymentSuccess = async (req, res) => {
  try {
    const result = await Order.findOneAndUpdate(
      {
        transaction_id: req.params.trx_id,
      },
      {
        payment: true,
      }
    );
    res.redirect(
      `${process.env.CLIENT_URL}/payment/success/${req.params.trx_id}`
    );
  } catch (error) {
    console.log(error);
  }
};

// Payment fail
export const paymentFail = async (req, res) => {
  try {
    const result = await Order.findOneAndDelete({
      transaction_id: req.params.trx_id,
    });

    res.redirect(`${process.env.CLIENT_URL}/payment/fail/${req.params.trx_id}`);
  } catch (error) {
    console.log(error);
  }
};
// cancel order
export const CancelOrderByUser = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params._id);
    res.status(200).send({
      success: true,
      message: 'Order Cancel successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: true,
      message: 'Order Not Cancel',
    });
  }
};

// extra
//upload img
export const uploadImage = async (req, res) => {
  try {
    const { name } = req.body;
    const urls = [];

    if (req.method === 'POST') {
      const files = req.files;
      for (const file of files) {
        const { path } = file;

        const result = await cloudinary.uploader.upload(path);

        const data = {
          url: result.secure_url,
          id: result.public_id,
        };

        urls.push(data);
        fs.unlinkSync(path);
      }
    }
    const userData = {
      name,
      img_url: urls,
    };

    const user2 = await User2.create(userData);

    res.status(201).send({ message: 'successful', data: user2 });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
};
//get all products
export const getImage = async (req, res) => {
  try {
    const user2 = await User2.find({}).sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: 'All img get successfully ',
      user2,
    });
  } catch (error) {
    console.log(error);
  }
};
