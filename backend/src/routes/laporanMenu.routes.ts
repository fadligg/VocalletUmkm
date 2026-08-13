import { Router } from 'express';
import { getNeraca, getLabaRugi, getNeracaSaldo, getBukuBesar, getJurnalUmum } from '../controllers/laporanMenu.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Endpoint Neraca
router.get('/neraca', verifyToken, getNeraca);

// Endpoint Laba Rugi
router.get('/labarugi', verifyToken, getLabaRugi);

// Endpoint Neraca Saldo
router.get('/neracasaldo', verifyToken, getNeracaSaldo);

// Endpoint Buku Besar
router.get('/bukubesar', verifyToken, getBukuBesar);

// Endpoint Jurnal Umum
router.get('/jurnalumum', verifyToken, getJurnalUmum);

export default router;
