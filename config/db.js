import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URL);
    console.log(
      `MongoDB is connected connection url ${connect.connection.host}`
    );
  } catch (error) {
    console.log('DB is not connect');
  }
};
export default connectDB;
