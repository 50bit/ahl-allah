import { Router, Request, Response } from 'express';
import { Call } from '../models';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { authenticateToken } from '../middleware/auth';
import { validateRequired } from '../utils/validation';

const router = Router();

// Get all calls
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Call.findAndCountAll({
      limit,
      offset,
      order: [['callDate', 'DESC']]
    });

    sendPaginatedResponse(res, 'Calls retrieved successfully', rows, page, limit, count);
  } catch (error) {
    console.error('Get calls error:', error);
    sendError(res, 500, 'Failed to retrieve calls');
  }
});

// Get call by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const call = await Call.findByPk(id);
    if (!call) {
      return sendError(res, 404, 'Call not found');
    }

    sendSuccess(res, 'Call retrieved successfully', call);
  } catch (error) {
    console.error('Get call error:', error);
    sendError(res, 500, 'Failed to retrieve call');
  }
});

// Create call
router.post('/', authenticateToken, validateRequired(['studentId', 'mohafezId', 'callDate']), async (req: Request, res: Response) => {
  try {
    const { studentId, mohafezId, callDate, duration, notes } = req.body;

    const call = await Call.create({
      studentId,
      mohafezId,
      callDate: new Date(callDate),
      duration: duration || 0,
      status: 'scheduled',
      notes
    });

    sendSuccess(res, 'Call created successfully', call);
  } catch (error) {
    console.error('Create call error:', error);
    sendError(res, 500, 'Failed to create call');
  }
});

// Update call
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { callDate, duration, status, notes } = req.body;

    const call = await Call.findByPk(id);
    if (!call) {
      return sendError(res, 404, 'Call not found');
    }

    const updateData: any = {};
    if (callDate !== undefined) updateData.callDate = new Date(callDate);
    if (duration !== undefined) updateData.duration = duration;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await call.update(updateData);

    sendSuccess(res, 'Call updated successfully', call);
  } catch (error) {
    console.error('Update call error:', error);
    sendError(res, 500, 'Failed to update call');
  }
});

// Delete call
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const call = await Call.findByPk(id);
    if (!call) {
      return sendError(res, 404, 'Call not found');
    }

    await call.destroy();

    sendSuccess(res, 'Call deleted successfully');
  } catch (error) {
    console.error('Delete call error:', error);
    sendError(res, 500, 'Failed to delete call');
  }
});

export default router;
