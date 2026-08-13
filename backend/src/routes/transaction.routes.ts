import { Router } from 'express';
import { getTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction } from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', verifyToken, getTransactions);
router.get('/:id', verifyToken, getTransactionById);
router.post('/', verifyToken, createTransaction);
router.put('/:id', verifyToken, updateTransaction);
router.delete('/:id', verifyToken, deleteTransaction);

export default router;
