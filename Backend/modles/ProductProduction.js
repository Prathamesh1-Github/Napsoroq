const mongoose = require('mongoose');

const ProductProductionSchema = new mongoose.Schema({
    totalUnitsProduced: { type: Number, required: true },
    goodUnitsProduced: { type: Number, required: true },
    goodUnitsWithoutRework: { type: Number, required: true },
    scrapUnits: { type: Number, required: true },
        scrapReasons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScrapReason'
    }],
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    actualMaterialUsed: {
        type: Map,
        of: Number,
        default: {}
    },
    estimatedMaterialUsed: {
        type: Map,
        of: Number,
        default: {}
    },
    estimatedSemiFinishedUsed: {
        type: Map,
        of: Number,
        default: {}
    },
    actualSemiFinishedUsed: {
        type: Map,
        of: Number,
        default: {}
    },
    productType: {
        type: String,
        enum: ['Product', 'SemiFinishedProduct'],
        required: true
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }

}, { timestamps: true });

module.exports = mongoose.model('ProductProduction', ProductProductionSchema);
