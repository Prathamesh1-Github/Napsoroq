// models/ScrapReason.js
const mongoose = require('mongoose');

const ScrapReasonSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ScrapReason', ScrapReasonSchema);
