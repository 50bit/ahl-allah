import { Router, Request, Response } from 'express';
import { User, MohafezUser } from '../models';
import { sendSuccess, sendError } from '../utils/response';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Approve mohafez (Admin only)
router.put('/approve-mohafez/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser) {
      return sendError(res, 404, 'Mohafez user not found');
    }

    if (user.roleId !== UserRole.NOT_ACCEPTED_MOHAFEZ) {
      return sendError(res, 400, 'User is not a pending mohafez');
    }

    await user.update({ roleId: UserRole.MOHAFEZ });

    sendSuccess(res, 'Mohafez approved successfully', {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      mohafezUser: user.MohafezUser
    });
  } catch (error) {
    console.error('Approve mohafez error:', error);
    sendError(res, 500, 'Failed to approve mohafez');
  }
});

// Reject mohafez (Admin only)
router.put('/reject-mohafez/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{ model: MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser) {
      return sendError(res, 404, 'Mohafez user not found');
    }

    if (user.roleId !== UserRole.NOT_ACCEPTED_MOHAFEZ) {
      return sendError(res, 400, 'User is not a pending mohafez');
    }

    // Delete the mohafez profile and user
    await user.MohafezUser.destroy();
    await user.destroy();

    sendSuccess(res, 'Mohafez rejected and removed successfully');
  } catch (error) {
    console.error('Reject mohafez error:', error);
    sendError(res, 500, 'Failed to reject mohafez');
  }
});

// Get pending mohafez applications (Admin only)
router.get('/pending-mohafez', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const pendingMohafez = await User.findAll({
      where: { roleId: UserRole.NOT_ACCEPTED_MOHAFEZ },
      include: [{ model: MohafezUser, as: 'MohafezUser' }],
      order: [['creationDate', 'DESC']]
    });

    const mohafezApplications = pendingMohafez.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      creationDate: user.creationDate,
      mohafezUser: user.MohafezUser
    }));

    sendSuccess(res, 'Pending mohafez applications retrieved successfully', mohafezApplications);
  } catch (error) {
    console.error('Get pending mohafez error:', error);
    sendError(res, 500, 'Failed to retrieve pending mohafez applications');
  }
});

// Update user role (Admin only)
router.put('/update-role/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!Object.values(UserRole).includes(roleId)) {
      return sendError(res, 400, 'Invalid role ID');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.update({ roleId });

    sendSuccess(res, 'User role updated successfully', {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId
    });
  } catch (error) {
    console.error('Update user role error:', error);
    sendError(res, 500, 'Failed to update user role');
  }
});

// Get system statistics (Admin only)
router.get('/statistics', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalNormalUsers = await User.count({ where: { roleId: UserRole.NORMAL } });
    const totalMohafez = await User.count({ where: { roleId: UserRole.MOHAFEZ } });
    const pendingMohafez = await User.count({ where: { roleId: UserRole.NOT_ACCEPTED_MOHAFEZ } });
    const totalAdmins = await User.count({ where: { roleId: UserRole.ADMIN } });

    const statistics = {
      totalUsers,
      totalNormalUsers,
      totalMohafez,
      pendingMohafez,
      totalAdmins,
      userDistribution: {
        normal: totalNormalUsers,
        mohafez: totalMohafez,
        pending: pendingMohafez,
        admin: totalAdmins
      }
    };

    sendSuccess(res, 'System statistics retrieved successfully', statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    sendError(res, 500, 'Failed to retrieve system statistics');
  }
});

export default router;
