const RawMaterial = require('../modles/RawMaterial'); // Ensure the correct path
const { StatusCodes } = require('http-status-codes');

// Save Raw Material Data
const saveRawMaterialData = async (req, res) => {
    try {
        req.body.createdBy = req.company.companyId; // Attach company ID
        const rawMaterial = await RawMaterial.create(req.body);
        res.status(StatusCodes.CREATED).json({ rawMaterial });
    } catch (error) {
        console.error("Error saving raw material data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving raw material data." });
    }
};

// Get All Raw Material Data for Company
const getRawMaterialData = async (req, res) => {
    try {
        const rawMaterials = await RawMaterial.find({ createdBy: req.company.companyId })
            .sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ rawMaterials });
    } catch (error) {
        console.error("Error fetching raw material data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching raw material data." });
    }
};

// Update Raw Material Stock for Company
const updateRawMaterialStock = async (req, res) => {
    try {
        const { rawMaterialCode, quantityReceived } = req.body;

        const rawMaterial = await RawMaterial.findOne({
            rawMaterialCode,
            createdBy: req.company.companyId
        });

        if (!rawMaterial) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Raw Material not found." });
        }

        rawMaterial.currentStockLevel += quantityReceived;
        await rawMaterial.save();

        res.status(StatusCodes.OK).json({ message: "Stock updated successfully", rawMaterial });
    } catch (error) {
        console.error("Error updating raw material stock:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating stock level." });
    }
};

// Get Low Stock Materials for Company
const getLowStockMaterials = async (req, res) => {
    try {
        const lowStockMaterials = await RawMaterial.find({
            createdBy: req.company.companyId,
            $expr: { $lt: ["$currentStockLevel", "$safetyStockLevel"] }
        });

        res.status(StatusCodes.OK).json({ lowStockMaterials });
    } catch (error) {
        console.error("Error fetching low-stock materials:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching low-stock materials." });
    }
};


module.exports = {
    saveRawMaterialData,
    getRawMaterialData,
    updateRawMaterialStock,
    getLowStockMaterials
};
