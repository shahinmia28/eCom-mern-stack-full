import Category from '../models/categoryModel.js';
import slugify from 'slugify';

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(401).send({ message: 'Name is required' });
    }
    const existCategory = await Category.findOne({ name });

    if (existCategory) {
      res.status(200).send({ message: 'Category is already exist' });
    }

    const category = await Category.create({
      name: name,
      slug: slugify(name),
    });
    res.status(201).send({
      success: true,
      message: 'Category is created successfully',
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Category is not created',
    });
  }
};

//update category
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: 'Category Updated Successfully',
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error while updating category',
    });
  }
};

// get all cat
export const allCategory = async (req, res) => {
  try {
    const category = await Category.find({});
    res.status(200).send({
      success: true,
      message: 'All Categories List',
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error while getting all categories',
    });
  }
};

// single category
export const singleCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ message: 'Category not found' });
    }
    res.status(200).send({
      success: true,
      message: 'Get Single Category Successfully',
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error While getting Single Category',
    });
  }
};

//delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: 'Category Deleted Successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'error while deleting category',
      error,
    });
  }
};
