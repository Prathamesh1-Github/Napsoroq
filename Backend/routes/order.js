const express = require("express");
const router = express.Router();

const { 
    createOrder, 
    getAllOrders, 
    getInProgressOrders, 
    getCompletedOrders, 
    deliverOrder, 
    completeOrder,
    bulkDeliverOrders,
    getOrdersByProductCurrentMonth,
    getOrdersByCustomerCurrentMonth,
    getOrderStatusMetrics,
    getCustomerInsights,
    getSalesPipeline,
    getOrderById,
    getInProgressOrderMetrics,
    updateOrder,
    cancelOrder,
    getAverageSellingPrice,
    getGrossProfitAllProductsUsingAvgSP,
    getFinancialSummary
} = require("../controllers/order");

router.route("/in-progress").get(getInProgressOrders);
router.route("/completed").get(getCompletedOrders);
router.route("/deliver/:id").put(deliverOrder);
router.route("/complete/:id").put(completeOrder);
router.route("/bulk-deliver").put(bulkDeliverOrders);

router.route("/orders-by-product").get(getOrdersByProductCurrentMonth);
router.route("/orders-by-customer").get(getOrdersByCustomerCurrentMonth);
router.get('/status-metrics', getOrderStatusMetrics);
router.get('/customer-insights', getCustomerInsights);
router.get('/sales-pipeline', getSalesPipeline);
router.get('/in-progress-metrics', getInProgressOrderMetrics);
router.route("/averagesp").get(getAverageSellingPrice);
router.get("/grossprofit", getGrossProfitAllProductsUsingAvgSP);
router.get("/financesummary", getFinancialSummary);


router.route("/:id").get(getOrderById).put(updateOrder); // <-- move this to the bottom
router.route("/").post(createOrder).get(getAllOrders);


router.put('/:id/cancel', cancelOrder);

module.exports = router;

