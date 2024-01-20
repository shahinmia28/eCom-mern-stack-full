import { Schema, model } from 'mongoose';

const userSchema2 = new Schema(
  {
    name: {
      type: String,
    },

    img_url: {
      type: Array,
    },
    // image: {
    //   type: String,
    // },
    // cloudinary_img_id: {
    //   type: String,
    // },
  },
  { timestamps: true }
);

const User2 = model('user2s', userSchema2);

export default User2;
