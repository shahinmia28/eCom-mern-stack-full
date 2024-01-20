import mongoose, { Schema, model } from 'mongoose';
const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
});
const Category = mongoose.model('Category', categorySchema);

export default Category;
