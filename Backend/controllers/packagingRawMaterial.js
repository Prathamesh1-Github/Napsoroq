const PackagingRawMaterial = require('../modles/PackagingRawMaterial');
const { StatusCodes } = require('http-status-codes');

// Create new packaging material (Scoped by company)
const createPackagingMaterial = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const packaging = await PackagingRawMaterial.create({
            ...req.body,
            createdBy: companyId
        });
        res.status(StatusCodes.CREATED).json({ message: 'Packaging material created', packaging });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating packaging material', error: error.message });
    }
};

// Get all packaging materials (with product info)
const getPackagingMaterials = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const materials = await PackagingRawMaterial.find({ createdBy: companyId })
            .populate('productsUsedFor.productId', 'productName');
        res.status(StatusCodes.OK).json({ materials });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching materials', error: error.message });
    }
};

// Get all packaging materials (bare, for AI or analysis use)
const getPackagingMaterialsAi = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const materials = await PackagingRawMaterial.find({ createdBy: companyId });
        res.status(StatusCodes.OK).json({ materials });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching materials', error: error.message });
    }
};


module.exports = {
    createPackagingMaterial,
    getPackagingMaterials,
    getPackagingMaterialsAi
};
