import { Router, Request, Response } from 'express';
import { User, NormalUser, MohafezUser } from '../models';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { authenticateToken, requireAdmin, requireMohafez } from '../middleware/auth';
import { validateRequired } from '../utils/validation';
import { UserRole } from '../types';

const router = Router();

// Get user by email
router.get('/get_user/:email', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        { model: NormalUser, as: 'NormalUser' },
        { model: MohafezUser, as: 'MohafezUser' }
      ]
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 'User retrieved successfully', {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      roleId: user.roleId,
      creationDate: user.creationDate,
      lastActivityDate: user.lastActivityDate,
      normalUser: user.NormalUser,
      mohafezUser: user.MohafezUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 500, 'Failed to retrieve user');
  }
});

// Get all users (Admin only)
router.get('/all', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      include: [
        { model: NormalUser, as: 'NormalUser' },
        { model: MohafezUser, as: 'MohafezUser' }
      ],
      limit,
      offset,
      order: [['creationDate', 'DESC']]
    });

    const users = rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      roleId: user.roleId,
      creationDate: user.creationDate,
      lastActivityDate: user.lastActivityDate,
      normalUser: user.NormalUser,
      mohafezUser: user.MohafezUser
    }));

    sendPaginatedResponse(res, 'Users retrieved successfully', users, page, limit, count);
  } catch (error) {
    console.error('Get all users error:', error);
    sendError(res, 500, 'Failed to retrieve users');
  }
});

// Get mohafez users
router.get('/mohafez', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { roleId: UserRole.MOHAFEZ },
      include: [
        { model: MohafezUser, as: 'MohafezUser' }
      ],
      limit,
      offset,
      order: [['creationDate', 'DESC']]
    });

    const mohafezUsers = rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      roleId: user.roleId,
      creationDate: user.creationDate,
      lastActivityDate: user.lastActivityDate,
      mohafezUser: user.MohafezUser
    }));

    sendPaginatedResponse(res, 'Mohafez users retrieved successfully', mohafezUsers, page, limit, count);
  } catch (error) {
    console.error('Get mohafez users error:', error);
    sendError(res, 500, 'Failed to retrieve mohafez users');
  }
});

// Get normal users
router.get('/normal', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: { roleId: UserRole.NORMAL },
      include: [
        { model: NormalUser, as: 'NormalUser' }
      ],
      limit,
      offset,
      order: [['creationDate', 'DESC']]
    });

    const normalUsers = rows.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      roleId: user.roleId,
      creationDate: user.creationDate,
      lastActivityDate: user.lastActivityDate,
      normalUser: user.NormalUser
    }));

    sendPaginatedResponse(res, 'Normal users retrieved successfully', normalUsers, page, limit, count);
  } catch (error) {
    console.error('Get normal users error:', error);
    sendError(res, 500, 'Failed to retrieve normal users');
  }
});

// Update user profile
router.put('/update', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, country, city, birthyear, gender } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (country) updateData.country = country;
    if (city) updateData.city = city;
    if (birthyear) {
      updateData.birthyear = birthyear;
      updateData.age = new Date().getFullYear() - birthyear;
    }
    if (gender) updateData.gender = gender;

    await user.update(updateData);

    sendSuccess(res, 'User updated successfully', {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      city: user.city,
      birthyear: user.birthyear,
      age: user.age,
      gender: user.gender,
      roleId: user.roleId
    });
  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, 500, 'Failed to update user');
  }
});

// Update normal user profile
router.put('/update-normal', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { availableMinutes, ageGroup, levelAtQuran, numberPerWeek, timeForEverytime, language, methodForHefz, isPaid, isFirstTime } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ model: NormalUser, as: 'NormalUser' }]
    });

    if (!user || !user.NormalUser) {
      return sendError(res, 404, 'Normal user not found');
    }

    const updateData: any = {};
    if (availableMinutes !== undefined) updateData.availableMinutes = availableMinutes;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (levelAtQuran !== undefined) updateData.levelAtQuran = levelAtQuran;
    if (numberPerWeek !== undefined) updateData.numberPerWeek = numberPerWeek;
    if (timeForEverytime !== undefined) updateData.timeForEverytime = timeForEverytime;
    if (language !== undefined) updateData.language = language;
    if (methodForHefz !== undefined) updateData.methodForHefz = methodForHefz;
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (isFirstTime !== undefined) updateData.isFirstTime = isFirstTime;

    await user.NormalUser.update(updateData);

    sendSuccess(res, 'Normal user updated successfully', user.NormalUser);
  } catch (error) {
    console.error('Update normal user error:', error);
    sendError(res, 500, 'Failed to update normal user');
  }
});

// Update mohafez profile
router.put('/update-mohafez', authenticateToken, requireMohafez, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { arabicName, summery, ejaza, myEjazaEnum, degree, isAvailable, freeDaysCount, totalHoursCount, language, phoneNumber, whatsappPhoneNumber, getPaid, schedule } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ model: MohafezUser, as: 'MohafezUser' }]
    });

    if (!user || !user.MohafezUser) {
      return sendError(res, 404, 'Mohafez user not found');
    }

    const updateData: any = {};
    if (arabicName !== undefined) updateData.arabicName = arabicName;
    if (summery !== undefined) updateData.summery = summery;
    if (ejaza !== undefined) updateData.ejaza = ejaza;
    if (myEjazaEnum !== undefined) updateData.myEjazaEnum = myEjazaEnum;
    if (degree !== undefined) updateData.degree = degree;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (freeDaysCount !== undefined) updateData.freeDaysCount = freeDaysCount;
    if (totalHoursCount !== undefined) updateData.totalHoursCount = totalHoursCount;
    if (language !== undefined) updateData.language = language;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (whatsappPhoneNumber !== undefined) updateData.whatsappPhoneNumber = whatsappPhoneNumber;
    if (getPaid !== undefined) updateData.getPaid = getPaid;
    if (schedule !== undefined) updateData.schedule = schedule;

    await user.MohafezUser.update(updateData);

    sendSuccess(res, 'Mohafez user updated successfully', user.MohafezUser);
  } catch (error) {
    console.error('Update mohafez user error:', error);
    sendError(res, 500, 'Failed to update mohafez user');
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    await user.destroy();

    sendSuccess(res, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    sendError(res, 500, 'Failed to delete user');
  }
});

export default router;
