import { Router } from 'express';
import { 
  signUp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} from './auth.controller';

const authRouter = Router();

authRouter.post('/signup', signUp);
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

export { authRouter };