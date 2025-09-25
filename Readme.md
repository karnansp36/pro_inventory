
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

