import express from 'express';
import { login, register, verify, verifyJWT } from '../controllers/auth-controller.js';

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/verify-email', verify)
authRoutes.get('/verify-jwt', verifyJWT, (req, res) => {
  res.status(200).json({auth: true, message: 'Token is valid'});
});
export default authRoutes;

