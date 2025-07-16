const BusinessCustomer = require("../modles/BusinessCustomer");
const { StatusCodes } = require("http-status-codes");

// Save Business Customer
const saveBusinessCustomer = async (req, res) => {
    try {
        const customer = await BusinessCustomer.create({
            ...req.body,
            createdBy: req.company.companyId,
        });
        res.status(StatusCodes.CREATED).json({ customer });
    } catch (error) {
        console.error("Error saving customer data:", error);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Error saving customer data." });
    }
};

// Get All Business Customers
const getBusinessCustomers = async (req, res) => {
    try {
        const customers = await BusinessCustomer.find({ createdBy: req.company.companyId }).sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ customers });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Error fetching customer data." });
    }
};

module.exports = {
    saveBusinessCustomer,
    getBusinessCustomers,
};
