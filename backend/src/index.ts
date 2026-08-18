import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transaction.routes';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import laporanRoutes from './routes/laporanMenu.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { apiLogger } from './middleware/logger.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(apiLogger);

app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Vocallet UMKM Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
