const Supplier = require("../modles/Supplier");
const { StatusCodes } = require("http-status-codes");

// ✅ Save a new Supplier (with createdBy)
const saveSupplier = async (req, res) => {
    try {
        req.body.createdBy = req.company.companyId; // Add company ID to the request
        const supplier = await Supplier.create(req.body);
        res.status(StatusCodes.CREATED).json({ message: "Supplier added successfully", supplier });
    } catch (error) {
        console.error("Error saving supplier:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving supplier." });
    }
};

// ✅ Get all Suppliers for the company
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({ createdBy: req.company.companyId }).sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ suppliers });
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching suppliers." });
    }
};



module.exports = {
    saveSupplier,
    getSuppliers,
};
