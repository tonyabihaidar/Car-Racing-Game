import { Request, Response } from 'express';
import * as svc from './history.service';

export async function saveEncryption(req: Request, res: Response) {
  try {
    const userId = (req as any).userId; // From auth middleware
    const { algorithm, mode, plaintext, ciphertext, keyUsed, blockCount } = req.body;

    if (!algorithm || !plaintext || !ciphertext || !keyUsed) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await svc.saveEncryption(userId, {
      algorithm,
      mode,
      plaintext,
      ciphertext,
      keyUsed,
      blockCount,
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error('Save encryption error:', err);
    res.status(500).json({ message: err.message || 'Failed to save encryption' });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await svc.getUserHistory(userId, limit);
    res.json(history);
  } catch (err: any) {
    console.error('Get history error:', err);
    res.status(500).json({ message: err.message || 'Failed to get history' });
  }
}

export async function deleteItem(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    await svc.deleteHistoryItem(userId, id);
    res.json({ success: true, message: 'History item deleted' });
  } catch (err: any) {
    console.error('Delete item error:', err);
    res.status(400).json({ message: err.message || 'Failed to delete item' });
  }
}

export async function deleteAll(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    await svc.deleteAllHistory(userId);
    res.json({ success: true, message: 'All history deleted' });
  } catch (err: any) {
    console.error('Delete all error:', err);
    res.status(500).json({ message: err.message || 'Failed to delete history' });
  }
}