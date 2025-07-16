const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema({
    // 1️⃣ Basic Raw Material Details
    rawMaterialName: {
        type: String,
        required: [true, 'Please provide Raw Material Name']
    },
    rawMaterialCode: {
        type: String,
        unique: true,
        required: [true, 'Please provide Raw Material Code']
    },
    category: {
        type: String,
        required: true
    },
    
    // 2️⃣ Procurement & Supplier Information
    preferredSuppliers: [{ type: String }], // List of vendor names
    supplierPartNumber: {
        type: String
    },
    purchaseUOM: {
        type: String,
        enum: ['kg', 'g', 'L', 'ml', 'pieces', 'meters', 'packs', 'units', 'dozen', 'tons'],
        required: true
    },
    leadTime: {
        type: Number, // Days
        required: true
    },
    minimumOrderQuantity: {
        type: Number,
        required: true
    },
    
    // 3️⃣ Costing & Pricing Details
    pricePerUnit: {
        type: Number,
        required: true
    },
    lastPurchasePrice: {
        type: Number
    },
    
    // 4️⃣ Inventory & Storage Information
    stockLocation: {
        type: String
    },
    currentStockLevel: {
        type: Number,
        required: true
    },
    reorderPoint: {
        type: Number
    },
    safetyStockLevel: {
        type: Number
    },
    shelfLife: {
        type: Date // Expiry date, if applicable
    },
    storageConditions: {
        type: String // E.g., temperature, humidity, etc.
    },
    
    // 6️⃣ Compliance & Quality Checks
    qualityStandards: [{ type: String }], // E.g., ISO, FDA
    testingRequirements: {
        type: Boolean, // True if testing is required before use
        default: false
    },
    msds: {
        type: String // Material Safety Data Sheet link or reference
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', RawMaterialSchema);
