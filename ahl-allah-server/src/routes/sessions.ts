import { Router, Request, Response } from 'express';
import { Session } from '../models';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequired } from '../utils/validation';

const router = Router();

// Get all sessions
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Session.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    sendPaginatedResponse(res, 'Sessions retrieved successfully', rows, page, limit, count);
  } catch (error) {
    console.error('Get sessions error:', error);
    sendError(res, 500, 'Failed to retrieve sessions');
  }
});

// Get session by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id);
    if (!session) {
      return sendError(res, 404, 'Session not found');
    }

    sendSuccess(res, 'Session retrieved successfully', session);
  } catch (error) {
    console.error('Get session error:', error);
    sendError(res, 500, 'Failed to retrieve session');
  }
});

// Create session (Admin only)
router.post('/', authenticateToken, requireAdmin, validateRequired(['name', 'admidUid', 'maxMembers', 'level', 'language', 'timePerSession']), async (req: Request, res: Response) => {
  try {
    const { name, admidUid, maxMembers, level, language, timePerSession, summary } = req.body;
    const userId = (req as any).user.userId;

    const session = await Session.create({
      name,
      admidUid,
      maxMembers,
      members: 0,
      level,
      language,
      timePerSession,
      summary,
      userId
    });

    sendSuccess(res, 'Session created successfully', session);
  } catch (error) {
    console.error('Create session error:', error);
    sendError(res, 500, 'Failed to create session');
  }
});

// Update session (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, admidUid, maxMembers, level, language, timePerSession, summary } = req.body;

    const session = await Session.findByPk(id);
    if (!session) {
      return sendError(res, 404, 'Session not found');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (admidUid !== undefined) updateData.admidUid = admidUid;
    if (maxMembers !== undefined) updateData.maxMembers = maxMembers;
    if (level !== undefined) updateData.level = level;
    if (language !== undefined) updateData.language = language;
    if (timePerSession !== undefined) updateData.timePerSession = timePerSession;
    if (summary !== undefined) updateData.summary = summary;

    await session.update(updateData);

    sendSuccess(res, 'Session updated successfully', session);
  } catch (error) {
    console.error('Update session error:', error);
    sendError(res, 500, 'Failed to update session');
  }
});

// Delete session (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findByPk(id);
    if (!session) {
      return sendError(res, 404, 'Session not found');
    }

    await session.destroy();

    sendSuccess(res, 'Session deleted successfully');
  } catch (error) {
    console.error('Delete session error:', error);
    sendError(res, 500, 'Failed to delete session');
  }
});

export default router;
