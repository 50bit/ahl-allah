# TODO: Organization Model Implementation

In the current project, we already have a MohafezUser model that represents a user with the role Mohafez. I need to create a new Organization model with full CRUD operations.

## Requirements:

### Organization Structure
- An Organization can have multiple MohafezUsers.
- Each Organization has its own role hierarchy:
  - **Admin User**: can manage (create, update, delete) other MohafezUsers within the same organization.
  - **Normal MohafezUser**: has limited access as defined by the system.

### Verification
- Each Organization should include a `verified` property, similar to verification badges used by platforms like Twitter or Facebook, to indicate whether the organization has been officially verified.

### CRUD Operations
Implement endpoints/services for:
- Create an organization (with or without initial users).
- Read (get one or list all organizations, including their users and verification status).
- Update (organization details, users, roles, and verification status).
- Delete an organization.

### Role Enforcement
- Ensure that only an Admin User within the organization can modify other MohafezUsers.
- Normal users should not have permission to manage others.