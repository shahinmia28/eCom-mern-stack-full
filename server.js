import express from 'express';
import connectDB from './config/db.js';
import morgan from 'morgan';
import authRouter from './routers/authRoute.js';
import cors from 'cors';
import categoryRouter from './routers/categoryRouter.js';
import productRouter from './routers/productRouter.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('welcome to mern stack server');
});

// routers

app.use('/api/auth', authRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);

app.listen(PORT, async () => {
  console.log(`server is running at http://localhost:${PORT}`);
  await connectDB();
});
