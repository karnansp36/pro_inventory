# Project: Enterprise User Management System
# Stack: React (JS) + MUI + TailwindCSS, Node.js + Express, MongoDB
# Objective: Develop a robust, role-based user management system with Admin, BrandOwner, Manager, BranchOwner roles.

## Roles & Permissions
- Admin: Full CRUD on all users, assign roles, view hierarchy, bulk actions.
- BrandOwner: CRUD for assigned Managers, view their BranchOwners.
- Manager: CRUD for assigned BranchOwners, view own branches.
- BranchOwner: View/Edit own profile.

## Tasks (Task-Oriented for Agent)
### 1. Backend
1.1 Design MongoDB User Schema
  - Fields: name, email, password, role, parent (references the immediate superior)
  - Relationships: Admin → BrandOwner → Manager → BranchOwner
  - Pre-save hook: password hashing
  - Methods: password verification

1.2 Create API Endpoints
  - POST /users → Create user
  - GET /users → List users with filter & hierarchy
  - GET /users/:id → User detail
  - PUT /users/:id → Update user
  - DELETE /users/:id → Remove user
  - POST /users/bulk → Bulk create users
  - GET /hierarchy/:role/:id → Fetch hierarchical tree for a user

1.3 Middleware
  - Role-based authorization
  - Parent assignment validation (prevent invalid hierarchy)
  - Input validation & error handling

### 2. Frontend
2.1 Design Layout (React + MUI + Tailwind)
  - Admin Dashboard: Full hierarchy view
  - BrandOwner Dashboard: Managers + BranchOwners
  - Manager Dashboard: BranchOwners
  - BranchOwner Dashboard: Profile only

2.2 Components
  - User List Table: sortable, filterable, searchable
  - Hierarchy Tree: expandable nodes, shows role → subordinates
  - User Form Modal: create/edit user, assign parent, role selection
  - Bulk Import Modal: CSV / JSON import for multiple users
  - Notifications / Success/Error feedback

2.3 Features
  - Inline role reassignment
  - Expandable hierarchy for BrandOwner → Manager → BranchOwners
  - Pagination and lazy loading for large user sets

### 3. Additional Enterprise Features
- Audit logs for create/update/delete actions
- Role-based notifications
- Password reset workflow
- Indexes on role & parent for faster queries
- Bulk actions for Admin (delete, assign roles, export)

## Constraints
- Follow modular architecture: separate components, hooks, utils
- Use clean code, SOLID principles
- Responsive design with Tailwind
- Mongoose schema must support easy querying for hierarchy traversal
- Agent should provide code in **JavaScript**, not TypeScript

## Task Execution Instructions for Cursor Agent
- Generate **each task sequentially**, complete working code
- Include backend models, controllers, routes
- Include frontend components, pages, and state management
- Add comments only for critical logic
- Ensure role-based access and hierarchy constraints are respected

