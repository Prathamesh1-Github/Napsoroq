const mongoose = require('mongoose');

const ManualJobProductionSchema = new mongoose.Schema({
    // Reference to the product or semi-finished product
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'productType',
        required: true
    },
    // Type of product (Product or SemiFinishedProduct)
    productType: {
        type: String,
        enum: ['Product', 'SemiFinishedProduct'],
        required: true
    },
    // Reference to the manual job
    manualJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ManualJob',
        required: true
    },
    // Output quantity of the product/semi-finished product
    outputQuantity: {
        type: Number,
        required: true
    },
    // Rework quantity
    reworkQuantity: {
        type: Number,
        default: 0
    },
    // Scrap quantity
    scrapQuantity: {
        type: Number,
        default: 0
    },
    // Actual time taken for the manual job
    actualTimeTaken: {
        type: Number,
        required: true,
        description: 'Time taken in minutes'
    },

    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, { timestamps: true });

module.exports = mongoose.model('ManualJobProduction', ManualJobProductionSchema); 
