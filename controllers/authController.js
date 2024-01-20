import User from '../models/userModel.js';
import Jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Order from '../models/orderModel.js';

export const handleRegister = async (req, res, next) => {
  try {
    const { name, email, phone, address, password, answer } = req.body;

    // validation
    if (!name) {
      return res.send({ message: 'Name is required' });
    }
    if (!email) {
      return res.send({ message: 'email is required' });
    }
    if (!phone) {
      return res.send({ message: 'Phone is required' });
    }
    if (!password) {
      return res.send({ message: 'Password is required' });
    }
    if (!address) {
      return res.send({ message: 'Address is required' });
    }
    if (!answer) {
      return res.send({ message: 'Answer is required' });
    }

    const userData = {
      name,
      email,
      phone,
      address,
      password,
      answer,
    };
    // user Exist check
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(200).send({
        success: true,
        message: 'User already Exist. please login',
      });
    }

    const user = await User.create(userData);

    res.status(201).send({
      success: true,
      message: 'User Registered successfully',
      user,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: 'User dose not Registered',
    });
    next(error);
    console.error(error);
  }
};

export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        message: 'Invalid password or email',
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('User Not Exist. Sign up first');
    }
    // password match
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Password not match');
    }
    //Access Token
    const accessToken = Jwt.sign({ user }, process.env.JWT_ACCESS);

    // set cookie
    res.cookie('accessToken', accessToken, {
      // httpOnly: true,
      // secure: true,
      sameSite: 'none',
    });
    //  return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(200).send({
      success: true,
      message: 'Login successful',
      userData,
      accessToken,
    });
  } catch (error) {
    next(error);
    console.error(error);
  }
};

// forget password
export const handleForgetPassword = async (req, res, next) => {
  try {
    const { email, answer, newPassword } = req.body;

    // validation
    if (!email) {
      return res.send({ message: 'email is required' });
    }
    if (!newPassword) {
      return res.send({ message: 'newPassword is required' });
    }
    if (!answer) {
      return res.send({ message: 'Answer is required' });
    }

    // user Exist check
    const user = await User.findOne({ email, answer });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'Wrong Email Or Answer',
      });
    }

    await User.findByIdAndUpdate(user._id, { password: newPassword });
    res.status(200).send({
      success: true,
      message: 'Password Reset Successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Something went wrong',
      error,
    });
  }
};
// User Password update
export const updatePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.send({ message: 'User Not Found' });
    }

    // password match
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.send({ message: 'Password not match' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.send({ message: 'Password is not update' });
    }
    res.status(200).send({
      success: true,
      message: 'Password Reset Successfully',
    });
  } catch (error) {
    next(error);
  }
};
// User Email Change
export const emailChange = async (req, res, next) => {
  try {
    const { email, password, newEmail } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send({ message: 'User Not Found' });
    }

    // password match
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.send({ message: 'Password not match' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { email: newEmail },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.send({ message: 'Password is not update' });
    }
    res.status(200).send({
      success: true,
      message: 'Email Change Successfully',
      updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: 'Profile Updated Successfully',
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error WHile Update profile',
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('products', '-photo')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error WHile Getting Orders',
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('products', '-photo')
      .populate('buyer')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error WHile Geting Orders',
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error While Updating Order',
      error,
    });
  }
};
