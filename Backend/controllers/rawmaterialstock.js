const RawMaterialStock = require("../modles/RawMaterialStock");
const { StatusCodes } = require("http-status-codes");


// ✅ Save New Raw Material Stock Intake
const saveRawMaterialStock = async (req, res) => {
    try {
        const {
            rawMaterialId,
            batchNumber,
            dateReceived,
            expiryDate,
            quantityReceived,
            unitOfMeasurement,
            pricePerUnit,
            stockLocation,
            supplierName,
        } = req.body;

        // Calculate Total Cost
        const totalCost = quantityReceived * pricePerUnit;

        // Create and Save new Stock Intake Entry with company scope
        const stockEntry = await RawMaterialStock.create({
            rawMaterialId,
            batchNumber,
            dateReceived,
            expiryDate,
            quantityReceived,
            unitOfMeasurement,
            pricePerUnit,
            totalCost,
            stockLocation,
            supplierName,
            createdBy: req.company.companyId, // ✅ set createdBy
        });

        res.status(StatusCodes.CREATED).json({ message: "Stock Intake Added", stockEntry });
    } catch (error) {
        console.error("Error saving stock intake:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving stock intake." });
    }
};

// ✅ Fetch All Raw Material Stock Entries for the company
const getRawMaterialStock = async (req, res) => {
    try {
        const stockEntries = await RawMaterialStock.find({ createdBy: req.company.companyId })
            .populate("rawMaterialId", "rawMaterialName rawMaterialCode")
            .sort({ dateReceived: -1 });

        res.status(StatusCodes.OK).json({ stockEntries });
    } catch (error) {
        console.error("Error fetching stock intake data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching stock intake data." });
    }
};



module.exports = {
    saveRawMaterialStock,
    getRawMaterialStock,
};
