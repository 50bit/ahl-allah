import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { Organization, OrganizationMember, User, MohafezUser } from '../models';
import { OrgRole } from '../types';

const router = Router();

// Helpers
async function isOrgAdmin(userId: string, organizationId: number): Promise<boolean> {
  const membership = await OrganizationMember.findOne({ where: { userId, organizationId } });
  return !!membership && membership.orgRole === OrgRole.ADMIN;
}

// Create organization (optionally with initial users)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description, verified, users } = req.body as {
      name: string;
      description?: string;
      verified?: boolean;
      users?: { userId: string; orgRole?: OrgRole }[];
    };

    if (!name) return sendError(res, 400, 'Name is required');

    const org = await Organization.create({ name, description, verified: !!verified });

    // Creator becomes admin if not provided in users
    const creatorId = req.user!.userId;
    const hasProvidedCreator = (users || []).some(u => u.userId === creatorId);
    await OrganizationMember.create({ organizationId: org.organizationId, userId: creatorId, orgRole: OrgRole.ADMIN });

    if (users && users.length) {
      // Filter duplicates with creator
      const uniqueUsers = users.filter(u => u.userId !== creatorId || !hasProvidedCreator);
      for (const u of uniqueUsers) {
        // Ensure user exists
        const exists = await User.findByPk(u.userId);
        if (!exists) continue;
        await OrganizationMember.findOrCreate({
          where: { organizationId: org.organizationId, userId: u.userId },
          defaults: { orgRole: u.orgRole ?? OrgRole.MEMBER }
        });
      }
    }

    const result = await Organization.findByPk(org.organizationId, {
      include: [{ model: OrganizationMember, as: 'Members' }]
    });
    return sendSuccess(res, 'Organization created', result);
  } catch (error) {
    console.error('Create org error:', error);
    return sendError(res, 500, 'Failed to create organization');
  }
});

// List organizations
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const orgs = await Organization.findAll({
      include: [{ model: OrganizationMember, as: 'Members' }]
    });
    return sendSuccess(res, 'Organizations fetched', orgs);
  } catch (error) {
    console.error('List orgs error:', error);
    return sendError(res, 500, 'Failed to fetch organizations');
  }
});

// Get organization by id
router.get('/:organizationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    const org = await Organization.findByPk(organizationId, {
      include: [
        { model: OrganizationMember, as: 'Members', include: [{ model: User, as: 'User', include: [{ model: MohafezUser, as: 'MohafezUser' }] }] }
      ]
    });
    if (!org) return sendError(res, 404, 'Organization not found');
    return sendSuccess(res, 'Organization fetched', org);
  } catch (error) {
    console.error('Get org error:', error);
    return sendError(res, 500, 'Failed to fetch organization');
  }
});

// Update organization details, members, roles, verified
router.put('/:organizationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    const userId = req.user!.userId;
    if (!(await isOrgAdmin(userId, organizationId))) return sendError(res, 403, 'Only org admins can update');

    const { name, description, verified, addUsers, updateUsers, removeUserIds } = req.body as {
      name?: string;
      description?: string;
      verified?: boolean;
      addUsers?: { userId: string; orgRole?: OrgRole }[];
      updateUsers?: { userId: string; orgRole: OrgRole }[];
      removeUserIds?: string[];
    };

    const org = await Organization.findByPk(organizationId);
    if (!org) return sendError(res, 404, 'Organization not found');

    if (name !== undefined) org.name = name;
    if (description !== undefined) org.description = description;
    if (verified !== undefined) org.verified = !!verified;
    await org.save();

    // Add members
    if (addUsers && addUsers.length) {
      for (const u of addUsers) {
        const exists = await User.findByPk(u.userId);
        if (!exists) continue;
        await OrganizationMember.findOrCreate({
          where: { organizationId, userId: u.userId },
          defaults: { orgRole: u.orgRole ?? OrgRole.MEMBER }
        });
      }
    }

    // Update members' roles
    if (updateUsers && updateUsers.length) {
      for (const u of updateUsers) {
        await OrganizationMember.update({ orgRole: u.orgRole }, { where: { organizationId, userId: u.userId } });
      }
    }

    // Remove members
    if (removeUserIds && removeUserIds.length) {
      await OrganizationMember.destroy({ where: { organizationId, userId: { [Op.in]: removeUserIds } } });
    }

    const result = await Organization.findByPk(organizationId, {
      include: [{ model: OrganizationMember, as: 'Members' }]
    });
    return sendSuccess(res, 'Organization updated', result);
  } catch (error) {
    console.error('Update org error:', error);
    return sendError(res, 500, 'Failed to update organization');
  }
});

// Delete organization
router.delete('/:organizationId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const organizationId = parseInt(req.params.organizationId);
    const userId = req.user!.userId;
    if (!(await isOrgAdmin(userId, organizationId))) return sendError(res, 403, 'Only org admins can delete');

    const count = await Organization.destroy({ where: { organizationId } });
    if (!count) return sendError(res, 404, 'Organization not found');
    return sendSuccess(res, 'Organization deleted', { organizationId });
  } catch (error) {
    console.error('Delete org error:', error);
    return sendError(res, 500, 'Failed to delete organization');
  }
});

// Manage MohafezUsers within org (org admin only): assign/unassign MohafezUser to org if you later add relation
// Placeholder endpoints could be added when MohafezUser <-> Organization relation is defined on schema

export default router;

