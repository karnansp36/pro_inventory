
Dashboard Architecture Plan
🎯 Overall Strategy: Unified Component Architecture
Core Principle: Reuse the same dashboard components for all roles, with role-based enhancements
📊 Role Hierarchy & Data Flow
text
Admin → Managers → Branches → Branch Data
Admin Level
View all managers

Click manager → see their branches

Click branch → view branch dashboard with admin privileges

Manager Level
View assigned branches only

Click branch → view branch dashboard with manager privileges

Branch Level
Single dashboard component used by all roles

Role-based features enabled via props

🏗️ Component Architecture
1. Unified Dashboard Component
text
BranchOwnerDashboard/
├── BranchOwnerDashboard.jsx          # Main container
├── components/
│   ├── BranchHeader.jsx         # Branch info + role-based actions
│   ├── StatsOverview.jsx        # Sales, expenses, stock metrics
│   ├── DataTables/              # Reusable tables
│   │   ├── SalesTable.jsx       # With edit/delete for managers+
│   │   ├── StockRequestsTable.jsx
│   │   └── TransportTable.jsx
│   └── ActionButtons.jsx        # Role-specific actions
2. Role-Specific Entry Points
text
Pages/
├── admin/
│   ├── AdminDashboard.jsx       # Manager cards
│   └── ManagerDetail.jsx        # Manager's branches list
├── manager/
│   └── ManagerDashboard.jsx     # Branch list only
└── branch-owner/
    └── BranchOwnerDashboard.jsx # Direct to their branch
🔧 Implementation Plan
Phase 1: Core Dashboard Enhancement
Modify existing BranchOwnerDashboard to accept props:

branchId (which branch to display)

userRole (admin/manager/branch-owner)

enableEdit (boolean for edit capabilities)

enableDelete (boolean for delete capabilities)

Add role-based action components that conditionally render:

Edit buttons

Delete buttons

Approval workflows

Export options

Phase 2: Manager Dashboard
ManagerDashboard - Simple branch list view

Fetches only branches assigned to that manager

Each branch card links to: /dashboard/branch/:branchId?role=manager

Phase 3: Admin Dashboard
AdminDashboard - Manager cards view

Click manager → ManagerDetail showing their branches

Click branch → /dashboard/branch/:branchId?role=admin

Phase 4: Routing Structure
text
/dashboard/admin                    → AdminDashboard (manager cards)
/dashboard/admin/manager/:managerId → ManagerDetail (branch list)  
/dashboard/admin/branch/:branchId   → BranchOwnerDashboard (admin view)

/dashboard/manager                  → ManagerDashboard (branch list)
/dashboard/manager/branch/:branchId → BranchOwnerDashboard (manager view)

/dashboard/branch-owner             → BranchOwnerDashboard (owner view)
🎛️ Role-Based Feature Matrix
Feature	Branch Owner	Manager	Admin
View own data	✅	✅	✅
Edit own data	✅	✅	✅
View branch data	❌	✅ (assigned)	✅ (all)
Edit branch data	❌	✅ (assigned)	✅ (all)
Delete records	❌	✅ (assigned)	✅ (all)
Export data	✅	✅	✅
Approve requests	❌	✅	✅
🔄 Data Flow & State Management
1. Branch Data Fetching
Single API endpoint: GET /api/branches/:branchId/data

Returns consolidated data (sales, stock, transport, etc.)

Role-based filtering handled in frontend

2. Permissions Flow
text
User logs in → Check role → Redirect to appropriate dashboard
↓
Admin: See managers → Select manager → See branches → Select branch
Manager: See branches → Select branch  
Branch Owner: Direct to their branch
↓
All roles use same BranchOwnerDashboard with different props
3. URL Structure for State Management
text
/branch/:id?role=admin&managerId=xxx     # Admin viewing specific branch
/branch/:id?role=manager                 # Manager viewing branch  
/branch/:id?role=branch-owner            # Branch owner (no ID needed)
🛡️ Security & Access Control
Frontend Guards
Route protection based on user role

Component-level permission checks

Conditional rendering of sensitive actions

Backend Validation
Verify user has access to requested branch

Role-based data filtering in API responses

Audit logs for admin/manager actions

📱 User Experience Flow
Admin Journey
Login → See manager cards

Click manager → See their branches

Click branch → Full dashboard with edit/delete capabilities

Can navigate between managers/branches freely

Manager Journey
Login → See assigned branches

Click branch → Full dashboard with edit capabilities for that branch

Limited to assigned branches only

Branch Owner Journey
Login → Direct to their branch dashboard

View and manage only their data

No branch selection needed

✅ Success Metrics
✅ Single codebase for all dashboard views

✅ Consistent UX across roles

✅ Easy maintenance and updates

✅ Scalable permission system

✅ Reusable components

✅ Clear navigation hierarchy