const ChatMessage = require('../modles/ChatMessage');
const { v4: uuidv4 } = require('uuid');

const generateAIResponse = (userMessage) => {
    const input = userMessage.toLowerCase();

    if (input.includes('oee') || input.includes('efficiency')) {
        return {
            content: 'Your question has been noted and will be answered in the next insight generation. I\'m analyzing your OEE data and will provide detailed insights about efficiency trends, bottlenecks, and optimization opportunities.',
            insights: []
        };
    } else if (input.includes('inventory') || input.includes('materials')) {
        return {
            content: 'Your question about inventory and materials has been recorded. I\'ll analyze your current stock levels, reorder points, and material flow patterns to provide comprehensive insights in the upcoming analysis.',
            insights: []
        };
    } else if (input.includes('cost') || input.includes('profit')) {
        return {
            content: 'Your cost and profitability question has been stored for analysis. I\'ll examine your cost structures, margin trends, and identify optimization opportunities in the next insight generation cycle.',
            insights: []
        };
    } else {
        return {
            content: 'Your question has been noted and stored for comprehensive analysis. I\'ll provide detailed insights based on your manufacturing data in the next insight generation. Thank you for your query!'
        };
    }
};

exports.ChatController = {
    async getMessages(req, res) {
        try {
            const companyId = req.company.companyId;

            const messages = await ChatMessage.find({
                createdBy: companyId
            }).sort({ created_at: 1 });

            const formatted = [];

            messages.forEach((msg) => {
                if (msg.user_message) {
                    formatted.push({
                        id: `${msg._id}_user`,
                        role: 'user',
                        content: msg.user_message,
                        timestamp: msg.created_at
                    });
                }

                if (msg.ai_response) {
                    formatted.push({
                        id: `${msg._id}_assistant`,
                        role: 'assistant',
                        content: msg.ai_response,
                        timestamp: msg.created_at,
                        insights: msg.insights?.length ? msg.insights : undefined
                    });
                }
            });

            res.json({ messages: formatted });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createMessage(req, res) {
        try {
            const companyId = req.company.companyId;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Generate AI response
            const aiGenerated = generateAIResponse(message);

            // Save user message and AI response together
            const savedMessage = await ChatMessage.create({
                user_message: message,
                ai_response: aiGenerated.content,
                message_type: 'user',
                status: 'pending',
                insights: aiGenerated.insights || [],
                createdBy: companyId,
            });

            res.json({
                messages: [
                    {
                        id: `${savedMessage._id}_user`,
                        role: 'user',
                        content: savedMessage.user_message,
                        timestamp: savedMessage.created_at,
                    },
                    {
                        id: `${savedMessage._id}_assistant`,
                        role: 'assistant',
                        content: savedMessage.ai_response,
                        timestamp: savedMessage.created_at,
                        insights: savedMessage.insights,
                    }
                ],
            });
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLatestQuestions(req, res) {
        try {
            const companyId = req.company.companyId;

            const messages = await ChatMessage.find({
                createdBy: companyId,
                user_message: { $exists: true, $ne: null }
            }).sort({ created_at: -1 }).limit(10);

            const questions = messages.map(msg => ({
                id: msg._id.toString(),
                question: msg.user_message,
                answer: msg.ai_response,
                status: msg.status,
                timestamp: msg.created_at
            }));

            res.json({ questions });
        } catch (error) {
            console.error('Error fetching latest questions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getPendingQuestions(req, res) {
        try {
            const companyId = req.company.companyId;

            const pendingMessages = await ChatMessage.find({
                createdBy: companyId,
                status: 'pending',
                user_message: { $exists: true, $ne: null }
            }).sort({ created_at: -1 });

            const questions = pendingMessages.map(msg => ({
                id: msg._id.toString(),
                question: msg.user_message,
                timestamp: msg.created_at
            }));

            res.json({ questions });
        } catch (error) {
            console.error('Error fetching pending questions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateQuestionAnswer(req, res) {
        try {
            const { questionId } = req.params;
            const { answer } = req.body;
            const companyId = req.company.companyId;

            const updatedMessage = await ChatMessage.findOneAndUpdate(
                { _id: questionId, createdBy: companyId },
                { 
                    ai_response: answer,
                    status: 'answered'
                },
                { new: true }
            );

            if (!updatedMessage) {
                return res.status(404).json({ error: 'Question not found' });
            }

            res.json({ 
                success: true, 
                message: 'Question answered successfully',
                data: updatedMessage 
            });
        } catch (error) {
            console.error('Error updating question answer:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};