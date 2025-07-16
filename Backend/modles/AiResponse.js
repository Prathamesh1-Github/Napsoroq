const mongoose = require("mongoose");

const aiResponseSchema = new mongoose.Schema({
    prompt: String,
    response: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }

});

module.exports = mongoose.model("AiResponse", aiResponseSchema);
