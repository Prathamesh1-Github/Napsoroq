const express = require("express");
const router = express.Router();

const {
    getMessages,
    createMessage,
    getLatestQuestions,
    getPendingQuestions,
    updateQuestionAnswer
} = require("../controllers/chatController").ChatController;

// Chat messages routes
router.route("/messages").get(getMessages).post(createMessage);

// Questions routes
router.route("/latest-questions").get(getLatestQuestions);
router.route("/pending-questions").get(getPendingQuestions);
router.route("/questions/:questionId/answer").put(updateQuestionAnswer);

module.exports = router;