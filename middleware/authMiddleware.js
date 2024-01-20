import Jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const requiredSignIn = (req, res, next) => {
  try {
    const decoded = Jwt.verify(
      req.headers.authorization,
      process.env.JWT_ACCESS
    );
    req.user = decoded.user;

    next();
  } catch (error) {
    console.log(error);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: 'ops! you are not admin please go back',
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: 'Error in admin middleware',
    });
  }
};
