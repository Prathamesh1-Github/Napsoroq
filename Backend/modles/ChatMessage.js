const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    user_message: {
        type: String,
        required: false
    },
    ai_response: {
        type: String,
        required: false
    },
    message_type: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'answered'],
        default: 'pending'
    },
    insights: [{
        type: {
            type: String,
            enum: ['chart', 'recommendation', 'insight']
        },
        title: String,
        content: String
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);