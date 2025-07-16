// require("dotenv").config();
// const { GoogleGenAI } = require("@google/genai");
// const AiResponse = require("../modles/AiResponse.js"); // Still make sure this path is correct

// const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });


// const { getAllDashboardData } = require("../controllers/getAllDashboardData.js");
// const { fetchDashboardData } = require('../controllers/getAllDashboardData');


// const askAI = async (req, res) => {
//     try {
//         const prompt = "In short tell me what is AI?";

//         const result = await genAI.models.generateContent({
//             model: "gemini-2.0-flash",
//             contents: [{ role: "user", parts: [{ text: prompt }] }]
//         });

//         const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (!text) {
//             return res.status(500).json({ success: false, message: "No response text from AI" });
//         }

//         const saved = await AiResponse.create({ prompt, response: text, createdBy: req.company.companyId });
//         res.json({ success: true, data: saved });

//     } catch (error) {
//         console.error("AI call error:", error.response?.data || error.message || error);
//         res.status(500).json({ success: false, message: "AI call failed" });
//     }
// };

// const fs = require('fs');
// const path = require('path');

// const askAIWithDashboardData = async (req, res) => {
//     try {
//         // 1. Fetch dashboard data
//         const dashboardData = await fetchDashboardData(req);

//         if (!dashboardData || Object.keys(dashboardData).length === 0) {
//             return res.status(400).json({ success: false, message: "No dashboard data available" });
//         }

//         // 2. Read prompt from file
//         const promptPath = path.join(__dirname, '../prompts/geminiprompt.txt');
//         const staticPrompt = fs.readFileSync(promptPath, 'utf8');

//         // 3. Inject dynamic dashboard data
//         const finalPrompt = `${staticPrompt}\n\n🔹 DATA STRUCTURE:\n${JSON.stringify(dashboardData, null, 2)}`;

//         // 4. Call Gemini model
//         const result = await genAI.models.generateContent({
//             model: "gemini-1.5-flash",
//             contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
//         });

//         const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (!text) {
//             return res.status(500).json({ success: false, message: "No response from AI" });
//         }

//         // 5. Store response
//         const saved = await AiResponse.create({ prompt: finalPrompt, response: text, createdBy: req.company.companyId });

//         res.json({ success: true, data: saved });
//     } catch (error) {
//         console.error("AI processing error:", error.response?.data || error.message || error);
//         res.status(500).json({ success: false, message: "AI call failed" });
//     }
// };

// const getLatestAiResponse = async (req, res) => {
//     try {
//         const latestResponse = await AiResponse.findOne({ createdBy: req.company.companyId }).sort({ createdAt: -1 });

//         if (!latestResponse) {
//             return res.status(404).json({ success: false, message: "No AI responses found" });
//         }

//         let parsedData = null;

//         // Extract potential JSON from responseText or response field
//         const rawText = latestResponse.responseText || latestResponse.response;

//         // Try extracting JSON inside code block if wrapped
//         const jsonMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/);

//         const cleanedJsonString = jsonMatch ? jsonMatch[1] : rawText;

//         try {
//             parsedData = JSON.parse(cleanedJsonString);
//         } catch (err) {
//             console.warn("Warning: Failed to parse JSON, falling back to rawText as string.");
//             parsedData = rawText; // fallback to raw string
//         }

//         res.json({ success: true, data: parsedData });
//     } catch (error) {
//         console.error("Error fetching latest AI response:", error.message || error);
//         res.status(500).json({ success: false, message: "Failed to fetch latest AI response" });
//     }
// };

// const askAIBottleneckInsight = async (req, res) => {
//     try {
//         const dashboardData = await fetchDashboardData();

//         if (!dashboardData || Object.keys(dashboardData).length === 0) {
//             return res.status(400).json({ success: false, message: "No dashboard data available" });
//         }

//         const prompt = `
// You are NeuraOps AI, an expert AI assistant for bottleneck analysis in manufacturing. Using the structured production data below, analyze and generate insights.

// 🔹 OBJECTIVE:
// 1. Identify bottlenecks in machines, manual jobs, production, product production, manual job production
// 2. Explain their causes in simple language.
// 3. Suggest fixes or improvements.
// 4. Output structured JSON.

// 🔹 DATA:
// ${JSON.stringify(dashboardData, null, 2)}

// 🔹 OUTPUT FORMAT (strict JSON):

// {
//   "insights": [
//     {
//       "title": "Short, clear insight title",
//       "narrative": "Human-friendly explanation of the bottleneck and impact",
//       "affectedModules": ["ManualJob", "Machine"],
//       "problem": "What is happening",
//       "rootCause": "Why it's happening",
//       "recommendation": "What to do next",
//       "impact": "Estimated loss or gain if fixed",
//       "riskLevel": "Low | Medium | High"
//     }
//   ]
// }
//         `;

//         const result = await genAI.models.generateContent({
//             model: "gemini-2.0-flash",
//             contents: [{ role: "user", parts: [{ text: prompt }] }]
//         });

//         const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

//         res.json({ success: true, data: text });
//     } catch (error) {
//         console.error("AI insight error:", error.message || error);
//         res.status(500).json({ success: false, message: "AI insight generation failed" });
//     }
// };


// // const askAIWithDashboardData = async (req, res) => {
// //     try {
// //         // 1. Fetch dynamic dashboard data
// //         const dashboardData = await fetchDashboardData(req);

// //         if (!dashboardData || Object.keys(dashboardData).length === 0) {
// //             return res.status(400).json({ success: false, message: "No dashboard data available" });
// //         }

// //         // 2. Read the static prompt
// //         const promptPath = path.join(__dirname, '../prompts/geminiprompt.txt');
// //         const staticPrompt = fs.readFileSync(promptPath, 'utf8');

// //         // 3. Compose the full prompt with data
// //         const finalPrompt = `${staticPrompt}\n\n🔹 DATA STRUCTURE:\n${JSON.stringify(dashboardData, null, 2)}`;

// //         // 4. Call the Gemini model
// //         const result = await genAI.models.generateContent({
// //             model: "gemini-2.0-flash",
// //             contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
// //         });

// //         const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

// //         if (!rawText) {
// //             return res.status(500).json({ success: false, message: "No response from AI" });
// //         }

// //         // 5. Extract and parse JSON safely
// //         let jsonString = rawText;

// //         const tripleBacktickMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
// //         if (tripleBacktickMatch) {
// //             jsonString = tripleBacktickMatch[1];
// //         }

// //         let parsedResponse;
// //         try {
// //             parsedResponse = JSON.parse(jsonString);
// //         } catch (parseErr) {
// //             console.error("JSON Parse Error:", parseErr.message);
// //             return res.status(500).json({
// //                 success: false,
// //                 message: "Failed to parse AI response JSON",
// //                 rawOutput: rawText
// //             });
// //         }

// //         // 6. Save both prompt and parsed response
// //         const saved = await AiResponse.create({
// //             prompt: finalPrompt,
// //             response: JSON.stringify(parsedResponse),
// //             createdBy: req.company.companyId
// //         });

// //         // 7. Return clean JSON response
// //         return res.json({ success: true, data: parsedResponse });
// //     } catch (error) {
// //         console.error("AI processing error:", error.response?.data || error.message || error);
// //         return res.status(500).json({ success: false, message: "AI call failed", error: error.message });
// //     }
// // };


// // const askAIWithDashboardData = async (req, res) => {
// //     try {
// //         // 1. Fetch dynamic dashboard data
// //         const dashboardData = await fetchDashboardData(req);
// //         if (!dashboardData || Object.keys(dashboardData).length === 0) {
// //             return res.status(400).json({ success: false, message: "No dashboard data available" });
// //         }

// //         // 2. Read static prompt
// //         const promptPath = path.join(__dirname, '../prompts/geminiprompt.txt');
// //         const staticPrompt = fs.readFileSync(promptPath, 'utf8');

// //         // 3. Compose final prompt
// //         const finalPrompt = `${staticPrompt}\n\n🔹 DATA STRUCTURE:\n${JSON.stringify(dashboardData, null, 2)}`;

// //         // 4. Call Gemini
// //         const result = await genAI.models.generateContent({
// //             model: "gemini-2.0-flash",
// //             contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
// //         });

// //         const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

// //         if (!rawText) {
// //             return res.status(500).json({ success: false, message: "No response from AI" });
// //         }

// //         // 5. Extract JSON from possible formats
// //         let extracted = rawText.trim();

// //         // Remove markdown code block wrappers (``` or ```json)
// //         const match = extracted.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
// //         if (match) extracted = match[1].trim();

// //         // Attempt to fix malformed JSON (trailing commas, newlines)
// //         extracted = extracted
// //             .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
// //             .replace(/\\n/g, '\n') // fix newlines if escaped
// //             .replace(/\\"/g, '"') // fix escaped quotes if necessary
// //             .replace(/[\u0000-\u001F]+/g, ''); // remove control chars

// //         // 6. Try parsing
// //         let parsedResponse;
// //         try {
// //             parsedResponse = JSON.parse(extracted);
// //         } catch (err) {
// //             console.error("❌ JSON Parse Error:", err.message);
// //             return res.status(500).json({
// //                 success: false,
// //                 message: "Failed to parse AI response JSON",
// //                 rawOutput: rawText
// //             });
// //         }

// //         // 7. Save clean prompt and parsed response
// //         const saved = await AiResponse.create({
// //             prompt: finalPrompt,
// //             response: parsedResponse, // stored as parsed object (schema must allow Mixed or Array)
// //             createdBy: req.company.companyId
// //         });

// //         // 8. Send response
// //         return res.json({ success: true, data: parsedResponse });

// //     } catch (error) {
// //         console.error("AI processing error:", error?.response?.data || error.message || error);
// //         return res.status(500).json({
// //             success: false,
// //             message: "AI call failed",
// //             error: error.message
// //         });
// //     }
// // };


// module.exports = {
//     askAI,
//     askAIWithDashboardData,
//     getLatestAiResponse,
//     askAIBottleneckInsight
// };












require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const AiResponse = require("../modles/AiResponse.js");
const ChatMessage = require("../modles/ChatMessage.js");

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const { getAllDashboardData } = require("../controllers/getAllDashboardData.js");
const { fetchDashboardData } = require('../controllers/getAllDashboardData');

const askAI = async (req, res) => {
    try {
        const prompt = "In short tell me what is AI?";

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ success: false, message: "No response text from AI" });
        }

        const saved = await AiResponse.create({ prompt, response: text, createdBy: req.company.companyId });
        res.json({ success: true, data: saved });

    } catch (error) {
        console.error("AI call error:", error.response?.data || error.message || error);
        res.status(500).json({ success: false, message: "AI call failed" });
    }
};

const fs = require('fs');
const path = require('path');

const fetchPendingQuestions = async (companyId) => {
    try {
        const pendingQuestions = await ChatMessage.find({
            createdBy: companyId,
            status: 'pending',
            user_message: { $exists: true, $ne: null }
        }).sort({ created_at: -1 });

        return pendingQuestions.map(msg => ({
            id: msg._id.toString(),
            question: msg.user_message,
            timestamp: msg.created_at
        }));
    } catch (error) {
        console.error('Error fetching pending questions:', error);
        return [];
    }
};

const updateQuestionAnswers = async (companyId, questionAnswers) => {
    try {
        if (!questionAnswers || questionAnswers.length === 0) {
            return;
        }

        for (const qa of questionAnswers) {
            if (qa.id && qa.answer) {
                await ChatMessage.findOneAndUpdate(
                    {
                        _id: qa.id,
                        createdBy: companyId
                    },
                    {
                        ai_response: qa.answer,
                        status: 'answered'
                    },
                    { new: true }
                );
            }
        }
    } catch (error) {
        console.error('Error updating question answers:', error);
    }
};

const askAIWithDashboardData = async (req, res) => {
    try {
        // 1. Fetch dashboard data
        const dashboardData = await fetchDashboardData(req);

        if (!dashboardData || Object.keys(dashboardData).length === 0) {
            return res.status(400).json({ success: false, message: "No dashboard data available" });
        }

        // 2. Fetch pending questions
        const pendingQuestions = await fetchPendingQuestions(req.company.companyId);

        // 3. Read prompt from file
        const promptPath = path.join(__dirname, '../prompts/geminiprompt5.txt');
        const staticPrompt = fs.readFileSync(promptPath, 'utf8');

        // 4. Inject dynamic dashboard data and pending questions
        let finalPrompt = `${staticPrompt}\n\n🔹 DATA STRUCTURE:\n${JSON.stringify(dashboardData, null, 2)}`;

        if (pendingQuestions.length > 0) {
            finalPrompt += `\n\n🔹 PENDING USER QUESTIONS TO ANSWER:\n${JSON.stringify(pendingQuestions, null, 2)}`;
            finalPrompt += `\n\nIMPORTANT: Please provide specific answers to the pending questions above based on the dashboard data. Include these answers in format_13 with the question ID, question text, and detailed answer.`;
        }

        // 5. Call Gemini model
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
        });

        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return res.status(500).json({ success: false, message: "No response from AI" });
        }

        // 6. Extract and parse JSON safely
        let jsonString = rawText;

        const tripleBacktickMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (tripleBacktickMatch) {
            jsonString = tripleBacktickMatch[1];
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(jsonString);
        } catch (parseErr) {
            console.error("JSON Parse Error:", parseErr.message);
            return res.status(500).json({
                success: false,
                message: "Failed to parse AI response JSON",
                rawOutput: rawText
            });
        }

        // 7. Update question answers if format_13 exists
        if (parsedResponse.format_13 && Array.isArray(parsedResponse.format_13)) {
            await updateQuestionAnswers(req.company.companyId, parsedResponse.format_13);
        }

        // 8. Store response
        const saved = await AiResponse.create({
            prompt: finalPrompt,
            response: JSON.stringify(parsedResponse),
            createdBy: req.company.companyId
        });

        res.json({ success: true, data: parsedResponse });
    } catch (error) {
        console.error("AI processing error:", error.response?.data || error.message || error);
        res.status(500).json({ success: false, message: "AI call failed" });
    }
};

const getLatestAiResponse = async (req, res) => {
    try {
        const latestResponse = await AiResponse.findOne({ createdBy: req.company.companyId }).sort({ createdAt: -1 });

        if (!latestResponse) {
            return res.status(404).json({ success: false, message: "No AI responses found" });
        }

        let parsedData = null;

        // Extract potential JSON from responseText or response field
        const rawText = latestResponse.responseText || latestResponse.response;

        // Try extracting JSON inside code block if wrapped
        const jsonMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/);

        const cleanedJsonString = jsonMatch ? jsonMatch[1] : rawText;

        try {
            parsedData = JSON.parse(cleanedJsonString);
        } catch (err) {
            console.warn("Warning: Failed to parse JSON, falling back to rawText as string.");
            parsedData = rawText; // fallback to raw string
        }

        res.json({ success: true, data: parsedData });
    } catch (error) {
        console.error("Error fetching latest AI response:", error.message || error);
        res.status(500).json({ success: false, message: "Failed to fetch latest AI response" });
    }
};

const askAIBottleneckInsight = async (req, res) => {
    try {
        const dashboardData = await fetchDashboardData();

        if (!dashboardData || Object.keys(dashboardData).length === 0) {
            return res.status(400).json({ success: false, message: "No dashboard data available" });
        }

        const prompt = `
You are NeuraOps AI, an expert AI assistant for bottleneck analysis in manufacturing. Using the structured production data below, analyze and generate insights.

🔹 OBJECTIVE:
1. Identify bottlenecks in machines, manual jobs, production, product production, manual job production
2. Explain their causes in simple language.
3. Suggest fixes or improvements.
4. Output structured JSON.

🔹 DATA:
${JSON.stringify(dashboardData, null, 2)}

🔹 OUTPUT FORMAT (strict JSON):

{
  "insights": [
    {
      "title": "Short, clear insight title",
      "narrative": "Human-friendly explanation of the bottleneck and impact",
      "affectedModules": ["ManualJob", "Machine"],
      "problem": "What is happening",
      "rootCause": "Why it's happening",
      "recommendation": "What to do next",
      "impact": "Estimated loss or gain if fixed",
      "riskLevel": "Low | Medium | High"
    }
  ]
}
        `;

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        res.json({ success: true, data: text });
    } catch (error) {
        console.error("AI insight error:", error.message || error);
        res.status(500).json({ success: false, message: "AI insight generation failed" });
    }
};

module.exports = {
    askAI,
    askAIWithDashboardData,
    getLatestAiResponse,
    askAIBottleneckInsight
};