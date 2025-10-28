# Unified Dashboard Implementation Plan

## Phase 1: Core Dashboard Enhancement
- [ ] Modify `BranchOwnerDashboard.jsx` to accept `branchId`, `userRole`, `enableEdit`, `enableDelete` props.
- [ ] Add conditional rendering for role-based action components (Edit buttons, Delete buttons, Approval workflows, Export options) within `BranchOwnerDashboard.jsx`.

## Phase 2: Manager Dashboard
- [ ] Create or modify `ManagerDashboard.jsx` to display a list of branches assigned to the manager.
- [ ] Implement logic to fetch only branches assigned to the logged-in manager.
- [ ] Ensure each branch card in `ManagerDashboard.jsx` links to `/dashboard/manager/branch/:branchId` with `role=manager` prop.

## Phase 3: Admin Dashboard
- [ ] Create or modify `AdminDashboard.jsx` to display manager cards.
- [ ] Implement logic for clicking a manager card to navigate to `ManagerDetail.jsx` showing their branches.
- [ ] Create or modify `ManagerDetail.jsx` to display a list of branches for a selected manager.
- [ ] Ensure clicking a branch in `ManagerDetail.jsx` links to `/dashboard/admin/branch/:branchId` with `role=admin` prop.

## Phase 4: Routing Structure
- [ ] Define or update routes for Admin:
    - [ ] `/dashboard/admin` -> `AdminDashboard`
    - [ ] `/dashboard/admin/manager/:managerId` -> `ManagerDetail`
    - [ ] `/dashboard/admin/branch/:branchId` -> `BranchOwnerDashboard` (admin view)
- [ ] Define or update routes for Manager:
    - [ ] `/dashboard/manager` -> `ManagerDashboard`
    - [ ] `/dashboard/manager/branch/:branchId` -> `BranchOwnerDashboard` (manager view)
- [ ] Define or update routes for Branch Owner:
    - [ ] `/dashboard/branch-owner` -> `BranchOwnerDashboard` (owner view)

## Data Flow & State Management
- [ ] Implement a single API endpoint `GET /api/branches/:branchId/data` for consolidated branch data.
- [ ] Implement role-based filtering in the frontend for data displayed in `BranchOwnerDashboard.jsx`.
- [ ] Implement user login flow to check role and redirect to the appropriate dashboard.
- [ ] Ensure URL structure correctly passes `role` and `managerId` (if applicable) for state management.

## Security & Access Control
- [ ] Implement frontend route protection based on user role.
- [ ] Implement component-level permission checks and conditional rendering of sensitive actions.
- [ ] Ensure backend validation verifies user access to requested branch and filters data based on role.
- [ ] Implement audit logs for admin/manager actions on the backend.