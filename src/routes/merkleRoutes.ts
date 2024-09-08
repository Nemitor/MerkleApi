// src/routes/merkleRoutes.ts
import express from 'express';
import { getRoot, getProof, getMessage } from '../controllers/merkleController';

const router = express.Router();

router.get('/merkle/root', getRoot);
router.get('/merkle/proof/:id', getProof);
router.get('/merkle/message/:id', getMessage);

export default router;
