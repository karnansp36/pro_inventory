MERN Stack Multi-Level Shop Management System – AI Agent Prompt
1. Project Overview

Create a multi-level shop management system with role-based access control for Admin, Brand Owner, Manager, and Branch Owner. The system should manage:

Stock requests

Sales & income tracking

Expense tracking

Transport management

Reporting (daily, weekly, monthly, custom)

Tech Stack

Frontend: React + JavaScript + TailwindCSS

Backend: Express.js + Node.js + JWT authentication

Database: MongoDB

Authentication: JWT, Role-based

Reporting: PDF, Excel, CSV export

2. Project Folder Structure (Suggested)
/shop-management-app
│
├─ backend
│  ├─ models
│  │  ├─ User.js
│  │  ├─ StockRequest.js
│  │  ├─ Sales.js
│  │  ├─ Expense.js
│  │  └─ Transport.js
│  ├─ routes
│  │  ├─ authRoutes.js
│  │  ├─ userRoutes.js
│  │  ├─ stockRoutes.js
│  │  ├─ salesRoutes.js
│  │  ├─ expenseRoutes.js
│  │  └─ transportRoutes.js
│  ├─ controllers
│  ├─ middleware
│  │  └─ authMiddleware.js
│  └─ server.js
│
├─ frontend
│  ├─ src
│  │  ├─ components
│  │  ├─ pages
│  │  ├─ context
│  │  ├─ services
│  │  ├─ App.js
│  │  └─ index.js
│  └─ tailwind.config.js
│
└─ README.md

3. Database Schema (MongoDB)
3.1 User
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: String, // Admin, BrandOwner, Manager, BranchOwner
  assignedManager: ObjectId, // For BranchOwner
  assignedBranchOwners: [ObjectId], // For BrandOwner
  createdAt: Date,
  updatedAt: Date
}

3.2 StockRequest
{
  _id: ObjectId,
  branchOwner: ObjectId, // ref User
  productName: String,
  quantity: Number,
  priority: String, // Urgent, Required, Normal
  approved: Boolean,
  createdAt: Date,
  updatedAt: Date
}

3.3 Sales
{
  _id: ObjectId,
  branchOwner: ObjectId, // ref User
  cash: Number,
  gpay: Number,
  creditCard: Number,
  total: Number,
  date: Date,
  createdAt: Date
}

3.4 Expense
{
  _id: ObjectId,
  branchOwner: ObjectId, // ref User
  category: String,
  amount: Number,
  description: String,
  date: Date,
  createdAt: Date
}

3.5 Transport
{
  _id: ObjectId,
  stockRequest: ObjectId, // ref StockRequest
  bundleSize: Number,
  quantity: Number,
  from: String,
  to: String,
  receivedQuantity: Number,
  createdAt: Date
}

4. Functional Requirements

Admin

Full control, create/manage all users

Edit/delete any data

Generate reports

Brand Owner

Manage managers and branch owners

Approve stock requests

Add transport details

Edit/delete branch owner data

Manager

View assigned branch/shop data

Cannot add/edit/delete data

Branch Owner

Add stock requests, sales, expenses

Confirm received transport

Cannot edit/delete data

5. Features & Steps for AI Agent to Build
Step 1: Setup Backend

Initialize Node.js + Express project

Install dependencies: express, mongoose, bcrypt, jsonwebtoken, cors, dotenv

Create models for User, StockRequest, Sales, Expense, Transport

Setup JWT authentication with role-based middleware

Step 2: Setup Frontend

Initialize React project

Install TailwindCSS

Setup pages:

Login/Register

Dashboard (Role-specific)

Stock Requests

Sales

Expenses

Transport

Reports

Step 3: Implement Role-Based Access

Restrict actions based on role

Branch Owners: Add-only

Brand Owners/Admin: Edit/Delete any data

Managers: View-only

Step 4: Implement CRUD APIs

Users: Create/manage users

StockRequests: Add, approve, view

Sales: Add, view totals

Expenses: Add, view

Transport: Add, confirm received

Step 5: Implement Reports

Daily, weekly, monthly, custom reports

Filters: branch, manager, date, payment type, expense category

Export options: PDF, Excel, CSV

Step 6: UI/UX Design Guidelines

Responsive using TailwindCSS

Dashboard widgets for totals (sales, expenses, stock)

Color-coded priority indicators for stock (Urgent → Red, Required → Yellow, Normal → Green)

6. Deliverables

Fully functional MERN stack application

Role-based dashboards

CRUD functionality with restrictions

Reporting module

Responsive UI with TailwindCSS