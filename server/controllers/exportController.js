const asyncHandler = require('express-async-handler');
const Sales = require('../models/Sales');
const Expense = require('../models/Expense');
const StockRequest = require('../models/StockRequest');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// @desc    Export sales report to Excel
// @route   GET /api/export/sales/excel
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const exportSalesToExcel = asyncHandler(async (req, res) => {
  const { type, branch, manager, startDate, endDate, paymentType } = req.query;
  
  // Reuse the sales report logic
  const salesReport = await generateSalesData(req);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');
  
  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Branch Owner', key: 'branchOwner', width: 20 },
    { header: 'Cash', key: 'cash', width: 15 },
    { header: 'GPay', key: 'gpay', width: 15 },
    { header: 'Credit Card', key: 'creditCard', width: 15 },
    { header: 'Total', key: 'total', width: 15 }
  ];
  
  // Add data
  salesReport.sales.forEach(sale => {
    worksheet.addRow({
      date: sale.date.toLocaleDateString(),
      branchOwner: sale.branchOwner.name,
      cash: sale.cash,
      gpay: sale.gpay,
      creditCard: sale.creditCard,
      total: sale.total
    });
  });
  
  // Add summary row
  worksheet.addRow({});
  worksheet.addRow({
    date: 'TOTAL',
    cash: salesReport.summary.totalCash,
    gpay: salesReport.summary.totalGpay,
    creditCard: salesReport.summary.totalCreditCard,
    total: salesReport.summary.totalSales
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export expenses report to Excel
// @route   GET /api/export/expenses/excel
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const exportExpensesToExcel = asyncHandler(async (req, res) => {
  const expenseReport = await generateExpenseData(req);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses Report');
  
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Branch Owner', key: 'branchOwner', width: 20 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'description', width: 30 }
  ];
  
  expenseReport.expenses.forEach(expense => {
    worksheet.addRow({
      date: expense.date.toLocaleDateString(),
      branchOwner: expense.branchOwner.name,
      category: expense.category,
      amount: expense.amount,
      description: expense.description || ''
    });
  });
  
  worksheet.addRow({});
  worksheet.addRow({
    category: 'TOTAL EXPENSES',
    amount: expenseReport.summary.totalExpenses
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=expenses-report-${Date.now()}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export sales report to PDF
// @route   GET /api/export/sales/pdf
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const exportSalesToPDF = asyncHandler(async (req, res) => {
  const salesReport = await generateSalesData(req);
  
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
  
  doc.pipe(res);
  
  // Add content to PDF
  doc.fontSize(20).text('Sales Report', { align: 'center' });
  doc.moveDown();
  
  salesReport.sales.forEach(sale => {
    doc.fontSize(12)
       .text(`Date: ${sale.date.toLocaleDateString()} | Branch: ${sale.branchOwner.name}`)
       .text(`Cash: $${sale.cash} | GPay: $${sale.gpay} | Credit Card: $${sale.creditCard} | Total: $${sale.total}`)
       .moveDown();
  });
  
  doc.text(`TOTAL SALES: $${salesReport.summary.totalSales}`, { align: 'right' });
  doc.end();
});

// @desc    Export to CSV
// @route   GET /api/export/:type/csv
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const exportToCSV = asyncHandler(async (req, res) => {
  const { type } = req.params;
  let data, headers, filename;
  
  if (type === 'sales') {
    const report = await generateSalesData(req);
    data = report.sales;
    headers = 'Date,Branch Owner,Cash,GPay,Credit Card,Total\n';
    filename = `sales-report-${Date.now()}.csv`;
  } else if (type === 'expenses') {
    const report = await generateExpenseData(req);
    data = report.expenses;
    headers = 'Date,Branch Owner,Category,Amount,Description\n';
    filename = `expenses-report-${Date.now()}.csv`;
  }
  
  let csv = headers;
  data.forEach(item => {
    if (type === 'sales') {
      csv += `${item.date.toLocaleDateString()},"${item.branchOwner.name}",${item.cash},${item.gpay},${item.creditCard},${item.total}\n`;
    } else {
      csv += `${item.date.toLocaleDateString()},"${item.branchOwner.name}",${item.category},${item.amount},"${item.description || ''}"\n`;
    }
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
});

// Helper functions
async function generateSalesData(req) {
  // Implement sales data generation logic similar to reportController
  // This is a simplified version - you'd reuse your actual report logic
  const sales = await Sales.find({}).populate('branchOwner', 'name email').limit(100); // Limit for demo
  const summary = {
    totalSales: sales.reduce((sum, sale) => sum + sale.total, 0),
    totalCash: sales.reduce((sum, sale) => sum + sale.cash, 0),
    totalGpay: sales.reduce((sum, sale) => sum + sale.gpay, 0),
    totalCreditCard: sales.reduce((sum, sale) => sum + sale.creditCard, 0)
  };
  
  return { sales, summary };
}

async function generateExpenseData(req) {
  const expenses = await Expense.find({}).populate('branchOwner', 'name email').limit(100);
  const summary = {
    totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0)
  };
  
  return { expenses, summary };
}

module.exports = {
  exportSalesToExcel,
  exportExpensesToExcel,
  exportSalesToPDF,
  exportToCSV
};