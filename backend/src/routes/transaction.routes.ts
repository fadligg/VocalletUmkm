import { Router } from 'express';
import { getTransactions, getTransactionById, createTransaction, deleteTransaction, updateTransaction } from '../controllers/transaction.controller';

const router = Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
