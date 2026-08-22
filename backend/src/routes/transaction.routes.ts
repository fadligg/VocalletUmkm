import { Router } from 'express';
import { getTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction, resetTransactions } from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.delete('/reset', verifyToken, resetTransactions);
router.get('/', verifyToken, getTransactions);
router.get('/:id', verifyToken, getTransactionById);
router.post('/', verifyToken, createTransaction);
router.put('/:id', verifyToken, updateTransaction);
router.delete('/:id', verifyToken, deleteTransaction);

export default router;
