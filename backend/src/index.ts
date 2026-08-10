import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transaction.routes';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Vocallet UMKM Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
