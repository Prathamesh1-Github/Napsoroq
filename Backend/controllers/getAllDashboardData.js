const { getRawMaterialData } = require('../controllers/rawmaterial');
const { getSuppliers } = require('../controllers/supplier');
const { getBusinessCustomers } = require('../controllers/businessCustomer');
const { getChurnData } = require('../controllers/customerInsights');
const { getAllSalesLedgersAi, getAllPurchaseLedgers, getAllInvoicesAi } = require('../controllers/financialController');
const { getMachineData } = require('../controllers/machine');
const { getAllOrdersAi } = require('../controllers/order');
const { getPackagingMaterialsAi } = require('../controllers/packagingRawMaterial');
const { getProductsAi } = require('../controllers/product');
const { getProductionData } = require('../controllers/production');
const { getProductProduction } = require('../controllers/productProduction');
const { getSemiFinishedProductsAi } = require('../controllers/semiFinishedProductController')
const { StatusCodes } = require("http-status-codes");



const fetchDashboardData = async (req) => {
    const createResWrapper = () => {
        let jsonData;
        return {
            status: () => ({
                json: (data) => {
                    jsonData = data;
                }
            }),
            json: (data) => {
                jsonData = data;
            },
            getData: () => jsonData
        };
    };

    const machineRes = createResWrapper();
    const productRes = createResWrapper();
    const productionRes = createResWrapper();
    const productProductionRes = createResWrapper();
    const rawMaterialRes = createResWrapper();
    const supplierRes = createResWrapper();
    const businessCustomerRes = createResWrapper();
    const churnDataRes = createResWrapper();
    const salesLedgerRes = createResWrapper();
    const purchaseLedgerRes = createResWrapper();
    const invoiceRes = createResWrapper();
    const orderRes = createResWrapper();
    const packagingRes = createResWrapper();
    const semiFinishedRes = createResWrapper();

    const reqWithCompany = { company: req.company };

    await Promise.all([
        getMachineData(reqWithCompany, machineRes),
        getProductsAi(reqWithCompany, productRes),  
        getProductionData(reqWithCompany, productionRes),
        getProductProduction(reqWithCompany, productProductionRes),
        getRawMaterialData(reqWithCompany, rawMaterialRes),
        getSuppliers(reqWithCompany, supplierRes),
        getBusinessCustomers(reqWithCompany, businessCustomerRes),
        getChurnData(reqWithCompany, churnDataRes),
        getAllSalesLedgersAi(reqWithCompany, salesLedgerRes),
        getAllPurchaseLedgers(reqWithCompany, purchaseLedgerRes),
        getAllInvoicesAi(reqWithCompany, invoiceRes),
        getAllOrdersAi(reqWithCompany, orderRes),
        getPackagingMaterialsAi(reqWithCompany, packagingRes),
        getSemiFinishedProductsAi(reqWithCompany, semiFinishedRes)
    ]);

    return {
        machines: machineRes.getData()?.machines || [],
        products: productRes.getData()?.products || [],
        production: productionRes.getData()?.productions || [],
        productProduction: productProductionRes.getData()?.productions || [],
        rawMaterials: rawMaterialRes.getData()?.rawMaterials || [],
        suppliers: supplierRes.getData()?.suppliers || [],
        businessCustomers: businessCustomerRes.getData()?.customers || [],
        churnData: churnDataRes.getData()?.churn || {},
        salesLedgers: salesLedgerRes.getData()?.ledgers || [],
        purchaseLedgers: purchaseLedgerRes.getData()?.ledgers || [],
        invoices: invoiceRes.getData()?.invoices || [],
        orders: orderRes.getData()?.orders || [],
        packagingMaterials: packagingRes.getData()?.packagingMaterials || [],
        semiFinishedProducts: semiFinishedRes.getData()?.semiFinishedProducts || []
    };
};



// Your existing Express route handler - now uses fetchDashboardData internally
const getAllDashboardData = async (req, res) => {
    try {
        const data = await fetchDashboardData(req);
        res.status(StatusCodes.OK).json(data);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching dashboard data." });
    }
};



module.exports = { getAllDashboardData, fetchDashboardData };

