import mongoose, { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    products: [],
    payment: {
      type: Boolean,
    },
    transaction_id: {
      type: String,
    },
    totalPrice: {
      type: String,
      required: true,
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: 'users',
    },
    status: {
      type: String,
      default: 'Not Process',
      enum: ['Not Process', 'Processing', 'Shipped', 'delivered', 'cancel'],
    },
  },
  { timestamps: true }
);

const Order = model('Order', orderSchema);

export default Order;
// {
//   type: mongoose.ObjectId,
//   ref: 'Products',
// },
