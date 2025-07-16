const Order = require("../modles/Order");
const BusinessCustomer = require("../modles/BusinessCustomer");
const { StatusCodes } = require("http-status-codes");

const mongoose = require("mongoose");

// Get customer churn data (company-specific)
const getChurnData = async (req, res) => {
    try {
        const companyId = new mongoose.Types.ObjectId(req.company.companyId);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Get all customers for this company
        const allCustomers = await BusinessCustomer.find({ createdBy: companyId });

        const customerIds = allCustomers.map(c => c._id);

        // Get customers with recent orders
        const activeCustomers = await Order.distinct('customerId', {
            orderDate: { $gte: sixtyDaysAgo },
            createdBy: companyId,
            customerId: { $in: customerIds }
        });

        const churningCustomers = customerIds.length - activeCustomers.length;

        // Volume trend calculations
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const customerVolumes = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: thirtyDaysAgo },
                    createdBy: companyId
                }
            },
            {
                $group: {
                    _id: '$customerId',
                    currentMonthQuantity: { $sum: '$quantityOrdered' }
                }
            }
        ]);

        const previousCustomerVolumes = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(thirtyDaysAgo.getTime() - (30 * 24 * 60 * 60 * 1000)),
                        $lt: thirtyDaysAgo
                    },
                    createdBy: companyId
                }
            },
            {
                $group: {
                    _id: '$customerId',
                    previousMonthQuantity: { $sum: '$quantityOrdered' }
                }
            }
        ]);

        const previousQuantities = {};
        previousCustomerVolumes.forEach(item => {
            previousQuantities[item._id] = item.previousMonthQuantity;
        });

        let increasingVolume = 0;
        let decreasingVolume = 0;

        customerVolumes.forEach(customer => {
            const previousQuantity = previousQuantities[customer._id] || 0;
            if (customer.currentMonthQuantity > previousQuantity) {
                increasingVolume++;
            } else if (customer.currentMonthQuantity < previousQuantity) {
                decreasingVolume++;
            }
        });

        res.status(StatusCodes.OK).json({
            churningCustomers,
            increasingVolume,
            decreasingVolume
        });

    } catch (error) {
        console.error('Error getting churn data:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error getting churn data',
            error: error.message
        });
    }
};

// Get customer by ID (with company check)
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await BusinessCustomer.findOne({ _id: id, createdBy: req.company.companyId });

        if (!customer) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'Customer not found'
            });
        }

        res.status(StatusCodes.OK).json(customer);
    } catch (error) {
        console.error('Error getting customer details:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error getting customer details',
            error: error.message
        });
    }
};

// Get customer orders (company-specific)
const getCustomerOrders = async (req, res) => {
    try {
        const { id } = req.params;

        const orders = await Order.find({
            customerId: id,
            createdBy: req.company.companyId
        })
            .sort({ orderDate: -1 })
            .populate('productId', 'productName sellingPrice');

        res.status(StatusCodes.OK).json(orders);
    } catch (error) {
        console.error('Error getting customer orders:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Error getting customer orders',
            error: error.message
        });
    }
};

module.exports = {
    getChurnData,
    getCustomerById,
    getCustomerOrders
};
