import { Router, Request, Response } from 'express';
import { Note } from '../models';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { authenticateToken, requireMohafez } from '../middleware/auth';
import { validateRequired } from '../utils/validation';

const router = Router();

// Get all notes
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Note.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    sendPaginatedResponse(res, 'Notes retrieved successfully', rows, page, limit, count);
  } catch (error) {
    console.error('Get notes error:', error);
    sendError(res, 500, 'Failed to retrieve notes');
  }
});

// Get note by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);
    if (!note) {
      return sendError(res, 404, 'Note not found');
    }

    sendSuccess(res, 'Note retrieved successfully', note);
  } catch (error) {
    console.error('Get note error:', error);
    sendError(res, 500, 'Failed to retrieve note');
  }
});

// Create note (Mohafez only)
router.post('/', authenticateToken, requireMohafez, validateRequired(['title', 'content', 'studentId']), async (req: Request, res: Response) => {
  try {
    const { title, content, studentId } = req.body;
    const userId = (req as any).user.userId;

    // Get mohafez ID from user
    const user = await (await import('../models')).User.findByPk(userId, {
      include: [{ model: (await import('../models')).MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser) {
      return sendError(res, 404, 'Mohafez profile not found');
    }

    const note = await Note.create({
      title,
      content,
      mohafezId: user.MohafezUser.mohafezId,
      studentId
    });

    sendSuccess(res, 'Note created successfully', note);
  } catch (error) {
    console.error('Create note error:', error);
    sendError(res, 500, 'Failed to create note');
  }
});

// Update note (Mohafez only)
router.put('/:id', authenticateToken, requireMohafez, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).user.userId;

    const note = await Note.findByPk(id);
    if (!note) {
      return sendError(res, 404, 'Note not found');
    }

    // Verify that the note belongs to the current mohafez
    const user = await (await import('../models')).User.findByPk(userId, {
      include: [{ model: (await import('../models')).MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser || user.MohafezUser.mohafezId !== note.mohafezId) {
      return sendError(res, 403, 'Access denied');
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    await note.update(updateData);

    sendSuccess(res, 'Note updated successfully', note);
  } catch (error) {
    console.error('Update note error:', error);
    sendError(res, 500, 'Failed to update note');
  }
});

// Delete note (Mohafez only)
router.delete('/:id', authenticateToken, requireMohafez, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const note = await Note.findByPk(id);
    if (!note) {
      return sendError(res, 404, 'Note not found');
    }

    // Verify that the note belongs to the current mohafez
    const user = await (await import('../models')).User.findByPk(userId, {
      include: [{ model: (await import('../models')).MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser || user.MohafezUser.mohafezId !== note.mohafezId) {
      return sendError(res, 403, 'Access denied');
    }

    await note.destroy();

    sendSuccess(res, 'Note deleted successfully');
  } catch (error) {
    console.error('Delete note error:', error);
    sendError(res, 500, 'Failed to delete note');
  }
});

export default router;
