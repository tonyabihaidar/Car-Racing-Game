import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  saveEncryption,
  getHistory,
  deleteItem,
  deleteAll,
} from './history.controller';

const historyRouter = Router();

// All routes require authentication
historyRouter.post('/', authenticate, saveEncryption);
historyRouter.get('/', authenticate, getHistory);
historyRouter.delete('/all', authenticate, deleteAll);
historyRouter.delete('/:id', authenticate, deleteItem);

export { historyRouter };