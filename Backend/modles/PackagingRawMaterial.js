const mongoose = require('mongoose');

const PackagingRawMaterial = new mongoose.Schema({
    rawMaterialName: String,
    rawMaterialCode: {
        type: String,
        required: true,
        unique: true
    },
    category: String,
    purchaseUOM: String,
    currentStockLevel: Number,
    reorderPoint: Number,
    safetyStockLevel: Number,
    shelfLife: String,
    storageConditions: String,
    scrapWastageRate: Number,
    preferredSuppliers: [String],
    supplierPartNumber: String,
    leadTime: Number,
    minimumOrderQuantity: Number,
    pricePerUnit: Number,
    lastPurchasePrice: Number,
    qualityStandards: [String],
    testingRequirements: Boolean,   
    msds: String,

    // 🔗 New fields
    productsUsedFor: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            unitsPerPackage: {
                type: Number,
                required: true
            }
        }
    ],

    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, { timestamps: true });

module.exports = mongoose.model('PackagingRawMaterial', PackagingRawMaterial);
