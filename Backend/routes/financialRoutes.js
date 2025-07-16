const express = require('express');
const router = express.Router();

const {
  createSalesLedger,
  updateSalesLedger,
  getAllSalesLedgers,
  getSingleSalesLedger,
  createPurchaseLedger,
  updatePurchaseLedger,
  getAllPurchaseLedgers,
  getSinglePurchaseLedger,
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  getInvoicesByOrder,
  updateInvoiceStatus,
  
  getAllActiveSalesLedgers
} = require('../controllers/financialController');


// Sales Ledger routes
router.post('/sales-ledger', createSalesLedger);
router.put('/sales-ledger/:id', updateSalesLedger);

// Purchase Ledger routes
router.post('/purchase-ledger', createPurchaseLedger);
router.put('/purchase-ledger/:id', updatePurchaseLedger);

// Invoice routes
router.post('/invoice', createInvoice);
router.get('/invoice/order/:orderId', getInvoicesByOrder);
router.put('/invoice/:id/status', updateInvoiceStatus);

// GET routes added for all financial modules
router.get('/sales-ledger', getAllSalesLedgers);
router.get('/sales-ledger/active', getAllActiveSalesLedgers);
router.get('/sales-ledger/:id', getSingleSalesLedger);

router.get('/purchase-ledger', getAllPurchaseLedgers);
router.get('/purchase-ledger/:id', getSinglePurchaseLedger);

router.get('/invoice', getAllInvoices);
router.get('/invoice/:id', getSingleInvoice);


module.exports = router;
