// src/routes/userRoutes.ts
import express from 'express';
import { getRoot,getProof } from '../controllers/userController';

const router = express.Router();

router.get('/merkle/root', getRoot);
router.get('/merkle/proof/:id', getProof);

export default router;
