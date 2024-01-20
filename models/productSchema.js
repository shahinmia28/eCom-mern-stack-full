import mongoose, { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: 'Category',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = model('Products', productSchema);

export default Product;
