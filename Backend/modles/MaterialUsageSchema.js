const mongoose = require('mongoose');

const MaterialUsageSchema = new mongoose.Schema({
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
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        }
}, {
    timestamps: true
});

module.exports = mongoose.model('MaterialUsage', MaterialUsageSchema);
