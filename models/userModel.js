import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
  {
    name: {
      type: String,
      require: [true, 'Name is Required'],
      minlength: [3, 'At least 3 characters are required'],
      maxlength: [31, 'Under 31 characters are required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid Email!`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is Required'],
      minLength: [6, 'At least 3 characters are required'],
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
    },
    phone: {
      type: String,
      required: [true, 'Phone Number is Required'],
    },
    address: {
      type: {},
      required: [true, 'Address is Required'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is Required'],
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = model('users', userSchema);

export default User;
