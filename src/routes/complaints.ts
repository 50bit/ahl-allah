import { Router, Request, Response } from 'express';
import { Complaint } from '../models';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { authenticateToken } from '../middleware/auth';
import { validateRequired } from '../utils/validation';

const router = Router();

// Get all complaints
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Complaint.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    sendPaginatedResponse(res, 'Complaints retrieved successfully', rows, page, limit, count);
  } catch (error) {
    console.error('Get complaints error:', error);
    sendError(res, 500, 'Failed to retrieve complaints');
  }
});

// Get complaint by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    sendSuccess(res, 'Complaint retrieved successfully', complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    sendError(res, 500, 'Failed to retrieve complaint');
  }
});

// Create complaint
router.post('/', authenticateToken, validateRequired(['title', 'description', 'mohafezId']), async (req: Request, res: Response) => {
  try {
    const { title, description, mohafezId } = req.body;
    const userId = (req as any).user.userId;

    // Get student ID from user
    const user = await (await import('../models')).User.findByPk(userId, {
      include: [{ model: (await import('../models')).NormalUser, as: 'NormalUser' }]
    });

    if (!user || !user.NormalUser) {
      return sendError(res, 404, 'Student profile not found');
    }

    const complaint = await Complaint.create({
      title,
      description,
      studentId: user.NormalUser.normalUserId,
      mohafezId,
      status: 'pending'
    });

    sendSuccess(res, 'Complaint created successfully', complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    sendError(res, 500, 'Failed to create complaint');
  }
});

// Update complaint status (Admin only)
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = (req as any).user.roleId;

    // Only admin can update status
    if (userRole !== 1) {
      return sendError(res, 403, 'Access denied');
    }

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    await complaint.update({ status });

    sendSuccess(res, 'Complaint status updated successfully', complaint);
  } catch (error) {
    console.error('Update complaint status error:', error);
    sendError(res, 500, 'Failed to update complaint status');
  }
});

// Add rating to complaint
router.put('/:id/rating', authenticateToken, validateRequired(['rating']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = (req as any).user.userId;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    // Verify that the complaint belongs to the current user
    const user = await (await import('../models')).User.findByPk(userId, {
      include: [{ model: (await import('../models')).NormalUser, as: 'NormalUser' }]
    });

    if (!user || !user.NormalUser || user.NormalUser.normalUserId !== complaint.studentId) {
      return sendError(res, 403, 'Access denied');
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 400, 'Rating must be between 1 and 5');
    }

    await complaint.update({ rating });

    sendSuccess(res, 'Rating added successfully', complaint);
  } catch (error) {
    console.error('Add rating error:', error);
    sendError(res, 500, 'Failed to add rating');
  }
});

// Delete complaint
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.roleId;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    // Only admin or the student who created the complaint can delete it
    if (userRole !== 1) {
      const user = await (await import('../models')).User.findByPk(userId, {
        include: [{ model: (await import('../models')).NormalUser, as: 'NormalUser' }]
      });

      if (!user || !user.NormalUser || user.NormalUser.normalUserId !== complaint.studentId) {
        return sendError(res, 403, 'Access denied');
      }
    }

    await complaint.destroy();

    sendSuccess(res, 'Complaint deleted successfully');
  } catch (error) {
    console.error('Delete complaint error:', error);
    sendError(res, 500, 'Failed to delete complaint');
  }
});

export default router;
