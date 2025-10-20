
---

## 👑 ADMIN - Full System Control

### User Management
- ✅ Create, view, update, delete all users (Brand Owners, Managers, Branch Owners)  
- ✅ Assign Managers to Brand Owners  
- ✅ Assign Branch Owners to Managers  
- ✅ Reset passwords for any user  

### Data Management
- ✅ View ALL data across the entire system  
- ✅ Edit/Delete ANY records (sales, expenses, stock requests, transport)  
- ✅ Approve/reject stock requests  
- ✅ Manage transport details  

### Reporting & Analytics
- ✅ Generate comprehensive reports for entire system  
- ✅ Filter by any branch, manager, or date range  
- ✅ Sales reports with payment type breakdown  
- ✅ Expense reports by category  
- ✅ Stock request reports with priority filtering  
- ✅ Profit/Loss analysis  
- ✅ Export capabilities (PDF, Excel, CSV)  

### System Access
- ✅ Access to all modules and features  
- ✅ Override any restrictions  
- ✅ System-wide configuration  

---

## 🏢 BRAND OWNER - Business Unit Management

### User Management
- ✅ Create and assign Managers  
- ✅ Create and assign Branch Owners  
- ✅ View/edit Branch Owners under their management  
- ❌ Cannot manage other Brand Owners or Admins  

### Data Management
- ✅ View all data from assigned Branch Owners  
- ✅ Edit/Delete sales, expenses, stock requests for their branches  
- ✅ Approve/reject stock requests from their branches  
- ✅ Create and manage transport details  
- ✅ Delete transport records  

### Reporting & Analytics
- ✅ Generate reports for their assigned branches only  
- ✅ Filter by assigned managers and branches  
- ✅ Sales, expense, and stock reports  
- ✅ Performance analysis of their business unit  

### Restrictions
- ❌ Cannot access other Brand Owners' data  
- ❌ Cannot manage system-wide settings  
- ❌ Cannot create/edit other Brand Owners or Admins  

---

## 👨‍💼 MANAGER - Supervisory Role

### Data Viewing
- ✅ View data from Branch Owners assigned to them  
- ✅ Read-only access to sales, expenses, stock requests  
- ✅ Monitor transport status and receipts  

### Reporting
- ✅ Generate read-only reports for their assigned branches  
- ✅ View performance metrics  
- ✅ Filter data by date ranges and categories  

### Restrictions
- ❌ Cannot add, edit, or delete any data  
- ❌ Cannot approve stock requests  
- ❌ Cannot manage transport  
- ❌ Cannot create users  
- ❌ Read-only access only  

---

## 🏪 BRANCH OWNER - Operational Level

### Data Entry
- ✅ Add stock requests (Product name, quantity, priority: Urgent/Required/Normal)  
- ✅ Record daily sales (Cash, GPay, Credit Card with automatic total calculation)  
- ✅ Record expenses (Category, amount, description, date)  
- ✅ Confirm transport receipts (Compare sent vs received quantities)  

### Data Viewing
- ✅ View their own sales, expenses, and stock requests  
- ✅ View transport details assigned to their branch  
- ✅ Track approval status of their requests  

### Reporting
- ✅ Generate reports for their own branch only  
- ✅ View their performance metrics  
- ✅ Daily sales summaries  

### Restrictions
- ❌ Cannot edit or delete any data once submitted  
- ❌ Cannot view other branches' data  
- ❌ Cannot approve their own stock requests  
- ❌ Cannot manage users  
- ❌ Read-only for others' data  

---

## 📊 Feature Matrix by Role

| Feature              | Admin | Brand Owner       | Manager          | Branch Owner     |
|----------------------|-------|------------------|-----------------|-----------------|
| User Management      | ✅ Full | ✅ Limited        | ❌ None          | ❌ None          |
| Create Sales         | ✅     | ✅                | ❌               | ✅               |
| View Sales           | ✅ All | ✅ Assigned       | ✅ Assigned      | ✅ Own only      |
| Edit/Delete Sales    | ✅ All | ✅ Assigned       | ❌               | ❌               |
| Create Expenses      | ✅     | ✅                | ❌               | ✅               |
| View Expenses        | ✅ All | ✅ Assigned       | ✅ Assigned      | ✅ Own only      |
| Edit/Delete Expenses | ✅ All | ✅ Assigned       | ❌               | ❌               |
| Create Stock Requests| ✅     | ✅                | ❌               | ✅               |
| View Stock Requests  | ✅ All | ✅ Assigned       | ✅ Assigned      | ✅ Own only      |
| Approve Stock Req.   | ✅ All | ✅ Assigned       | ❌               | ❌               |
| Delete Stock Req.    | ✅ All | ✅ Assigned       | ❌               | ❌               |
| Create Transport     | ✅     | ✅                | ❌               | ❌               |
| View Transport       | ✅ All | ✅ Assigned       | ✅ Assigned      | ✅ Own only      |
| Confirm Receipt      | ✅     | ✅                | ❌               | ✅               |
| Delete Transport     | ✅ All | ✅ Assigned       | ❌               | ❌               |
| Generate Reports     | ✅ All | ✅ Assigned only  | ✅ Assigned only | ✅ Own branch    |
| Export Reports       | ✅ All | ✅ All formats    | ✅ All formats   | ✅ All formats   |

---

## 🔐 Key Security Rules
- **Data Isolation**: Users can only access data within their hierarchy  
- **Role-based Permissions**: Each role has strictly defined capabilities  
- **Branch Owner Restrictions**: Cannot modify data after submission  
- **Manager Read-Only**: Supervisory role with no modification rights  
- **Approval Workflow**: Stock requests require Brand Owner/Admin approval  

---

## 🚀 Typical Workflow

1. Branch Owner creates stock request → Brand Owner/Admin approves → Transport created → Branch Owner confirms receipt  
2. Branch Owner records daily sales → Manager/Brand Owner monitors performance  
3. Branch Owner logs expenses → System calculates profit/loss  
4. All roles generate relevant reports for their scope  

---

## 🛠️ Tech Stack
- **Frontend:** React + JavaScript + TailwindCSS  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT-based authentication  

---

## 📂 Project Structure (MERN)


## 7. Backend API Overview for Frontend Developers

This section provides a high-level overview of the backend API, focusing on the data models, available endpoints, and role-based access, to assist frontend developers in building the user interface. For detailed endpoint specifications, including sample requests and responses, please refer to the [`API_Documentation_and_Postman_Collection.md`](API_Documentation_and_Postman_Collection.md) file.

### 7.1. Data Models and Key Fields

The backend interacts with the following Mongoose models:

#### 7.1.1. User Model

*   **Purpose:** Manages user authentication, authorization, and hierarchical relationships.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the user.
    *   `name`: (Insert, Read, Update) User's full name.
    *   `email`: (Insert, Read, Update) User's email, must be unique.
    *   `password`: (Insert, Update) User's password (hashed on save).
    *   `role`: (Insert, Read, Update) User's role (`Admin`, `BrandOwner`, `Manager`, `BranchOwner`).
    *   `assignedManager`: (Insert, Read, Update) `ObjectId` reference to a Manager or BrandOwner. Used for hierarchy.
    *   `assignedBranchOwners`: (Read-only, managed by backend logic) Array of `ObjectId` references to Branch Owners managed by this user (if role is Manager/BrandOwner).
*   **CRUD Operations:**
    *   **Insert (Register):** `name`, `email`, `password`, `role`, `assignedManager` (optional for BranchOwner).
    *   **Read:** All fields except `password`.
    *   **Update:** `name`, `email`, `role`, `assignedManager`, `assignedBranchOwners`, `password`.
    *   **Delete:** User by `_id`.

#### 7.1.2. Sales Model

*   **Purpose:** Records daily sales transactions for a branch.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the sales record.
    *   `branchOwner`: (Read-only, set by backend) `ObjectId` reference to the BranchOwner who recorded the sale.
    *   `cash`: (Insert, Read, Update) Amount received in cash.
    *   `gpay`: (Insert, Read, Update) Amount received via GPay.
    *   `creditCard`: (Insert, Read, Update) Amount received via credit card.
    *   `total`: (Read-only, calculated by backend) Total sales amount.
    *   `date`: (Insert, Read, Update) Date of the sale.
*   **CRUD Operations:**
    *   **Insert (Create):** `cash`, `gpay`, `creditCard`, `total` (optional, calculated if not provided), `date` (optional, defaults to now).
    *   **Read:** All fields.
    *   **Update:** `cash`, `gpay`, `creditCard`, `total`, `date`. (Admin, BrandOwner only)
    *   **Delete:** Sales record by `_id`. (Admin, BrandOwner only)

#### 7.1.3. Expense Model

*   **Purpose:** Records expenses incurred by a branch.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the expense record.
    *   `branchOwner`: (Read-only, set by backend) `ObjectId` reference to the BranchOwner who recorded the expense.
    *   `category`: (Insert, Read, Update) Category of the expense (e.g., 'Rent', 'Utilities', 'Supplies').
    *   `amount`: (Insert, Read, Update) Amount of the expense.
    *   `description`: (Insert, Read, Update) Detailed description of the expense.
    *   `date`: (Insert, Read, Update) Date of the expense.
*   **CRUD Operations:**
    *   **Insert (Create):** `category`, `amount`, `description`, `date` (optional, defaults to now).
    *   **Read:** All fields.
    *   **Update:** `category`, `amount`, `description`, `date`. (Admin, BrandOwner only)
    *   **Delete:** Expense record by `_id`. (Admin, BrandOwner only)

#### 7.1.4. StockRequest Model

*   **Purpose:** Manages requests for stock from branches.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the stock request.
    *   `branchOwner`: (Read-only, set by backend) `ObjectId` reference to the BranchOwner who made the request.
    *   `productName`: (Insert, Read, Update) Name of the product requested.
    *   `quantity`: (Insert, Read, Update) Quantity of the product requested.
    *   `priority`: (Insert, Read, Update) Priority of the request (`High`, `Medium`, `Low`).
    *   `status`: (Read-only, updated by backend) Current status (`Pending`, `Approved`, `Rejected`).
    *   `approved`: (Read-only, updated by backend) Boolean indicating if the request is approved.
*   **CRUD Operations:**
    *   **Insert (Create):** `productName`, `quantity`, `priority`.
    *   **Read:** All fields.
    *   **Update (Approve):** `status`, `approved`. (Admin, BrandOwner only)
    *   **Delete:** Stock request by `_id`. (Admin, BrandOwner only)

#### 7.1.5. Transport Model

*   **Purpose:** Tracks the transport of stock requests.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the transport record.
    *   `stockRequest`: (Insert, Read) `ObjectId` reference to the associated StockRequest.
    *   `bundleSize`: (Insert, Read, Update) Number of items per bundle.
    *   `quantity`: (Insert, Read, Update) Total quantity being transported.
    *   `from`: (Insert, Read, Update) Origin location of the transport.
    *   `to`: (Insert, Read, Update) Destination location of the transport.
    *   `status`: (Read-only, updated by backend) Current status (e.g., 'In Transit', 'Delivered').
    *   `receivedQuantity`: (Insert, Read, Update) Quantity confirmed as received by the BranchOwner.
*   **CRUD Operations:**
    *   **Insert (Create):** `stockRequest`, `bundleSize`, `quantity`, `from`, `to`. (Admin, BrandOwner only)
    *   **Read:** All fields.
    *   **Update (Confirm Received):** `receivedQuantity`. (BranchOwner only)
    *   **Delete:** Transport record by `_id`. (Admin, BrandOwner only)

#### 7.1.6. ActivityLog Model

*   **Purpose:** Records significant user actions for auditing.
*   **Key Fields:**
    *   `_id`: (Read-only) Unique identifier for the log entry.
    *   `user`: (Read-only) `ObjectId` reference to the user who performed the action.
    *   `action`: (Read-only) Description of the action (e.g., 'LOGIN', 'CREATE_SALE').
    *   `resource`: (Read-only) The resource affected (e.g., 'User', 'Sales').
    *   `resourceId`: (Read-only) `ObjectId` of the affected resource.
    *   `description`: (Read-only) More detailed description of the activity.
    *   `ipAddress`: (Read-only) IP address from which the action was performed.
    *   `userAgent`: (Read-only) User agent string of the client.
    *   `createdAt`: (Read-only) Timestamp of the activity.
*   **CRUD Operations:**
    *   **Read:** All fields. (Admin, BrandOwner only)
    *   **Insert/Update/Delete:** Handled internally by the system, not directly exposed via API for these operations.

### 7.2. Role-Based Dashboard Considerations for Frontend

The frontend UI should dynamically adapt based on the authenticated user's `role`. The "Feature Matrix by Role" in Section 6 provides a clear guide for what each role can see and do.

*   **Admin Dashboard:**
    *   Full access to all management sections (Users, Sales, Expenses, Stock Requests, Transport).
    *   Ability to view, create, update, and delete any record across the entire system.
    *   Comprehensive reporting tools with all filtering options.
    *   User management interface for all roles.

*   **Brand Owner Dashboard:**
    *   Access to manage Managers and Branch Owners within their hierarchy.
    *   View and manage (edit/delete) sales, expenses, stock requests, and transport for their assigned branches.
    *   Ability to approve/reject stock requests.
    *   Reporting tools filtered to their business unit.

*   **Manager Dashboard:**
    *   Read-only access to view sales, expenses, stock requests, and transport data for their assigned Branch Owners.
    *   Reporting tools filtered to their assigned branches.
    *   No creation, editing, or deletion capabilities.

*   **Branch Owner Dashboard:**
    *   Primary interface for daily operations: creating sales, expenses, and stock requests.
    *   Ability to confirm received transport quantities.
    *   View only their own sales, expenses, and stock requests.
    *   Access to reports specific to their branch.
    *   No user management capabilities.

Frontend components (e.g., navigation links, buttons, data tables) should be conditionally rendered or disabled based on the `user.role` obtained from the `/api/auth/me` endpoint. For instance, a "Create User" button should only be visible to Admins and Brand Owners. Similarly, "Edit" and "Delete" actions on sales or expense records should only appear for roles with appropriate permissions.

This detailed breakdown should enable frontend developers to accurately implement the user interface and ensure proper role-based access control.



it is good to add