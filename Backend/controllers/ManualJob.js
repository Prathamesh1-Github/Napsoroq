const ManualJob = require("../modles/ManualJob");
const { StatusCodes } = require("http-status-codes");

// Save Manual Job
const saveManualJob = async (req, res) => {
    try {
        const {
            jobName,
            department,
            jobType,
            manualJobCategory,
            jobDescription,
            estimatedDuration,
            scrapReasonSamples,
            toolRequirement,
            minimumWorkersRequired,
            qualityCheckParameters,
            qualityCheckFrequency,
            costType,
            costPerUnit,
            hourlyCostRate,
            fixedCostPerDay
        } = req.body;

        const job = await ManualJob.create({
            jobName,
            department,
            jobType,
            manualJobCategory,
            jobDescription,
            estimatedDuration,
            scrapReasonSamples,
            toolRequirement,
            minimumWorkersRequired,
            qualityCheckParameters,
            qualityCheckFrequency,
            costType,
            costPerUnit,
            hourlyCostRate,
            fixedCostPerDay,
            createdBy: req.company.companyId
        });

        res.status(StatusCodes.CREATED).json({ job });
    } catch (error) {
        console.error("Error saving manual job data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error saving manual job data.",
        });
    }
};


// Get All Manual Jobs (scoped by company)
const getManualJobs = async (req, res) => {
    try {
        const jobs = await ManualJob.find({ createdBy: req.company.companyId }).sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ jobs });
    } catch (error) {
        console.error("Error fetching manual job data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching manual job data.",
        });
    }
};

// Get Single Manual Job by ID (scoped by company)
const getManualJobById = async (req, res) => {
    try {
        const job = await ManualJob.findOne({
            _id: req.params.id,
            createdBy: req.company.companyId
        });

        if (!job) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Manual job not found." });
        }

        res.status(StatusCodes.OK).json({ job });
    } catch (error) {
        console.error("Error fetching manual job by ID:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching manual job by ID.",
        });
    }
};



// Update Manual Job
const updateManualJob = async (req, res) => {
    try {
        const {
            jobName,
            department,
            jobType,
            manualJobCategory,
            jobDescription,
            estimatedDuration,
            scrapReasonSamples,
            toolRequirement,
            minimumWorkersRequired,
            qualityCheckParameters,
            qualityCheckFrequency,
            costType,
            costPerUnit,
            hourlyCostRate,
            fixedCostPerDay
        } = req.body;

        const job = await ManualJob.findByIdAndUpdate(
            { _id: req.params.id, createdBy: req.company.companyId },
            {
                jobName,
                department,
                jobType,
                manualJobCategory,
                jobDescription,
                estimatedDuration,
                scrapReasonSamples,
                toolRequirement,
                minimumWorkersRequired,
                qualityCheckParameters,
                qualityCheckFrequency,
                costType,
                costPerUnit,
                hourlyCostRate,
                fixedCostPerDay
            },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Manual job not found." });
        }

        res.status(StatusCodes.OK).json({ job });
    } catch (error) {
        console.error("Error updating manual job:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating manual job.",
        });
    }
};


// Delete Manual Job
const deleteManualJob = async (req, res) => {
    try {
        const job = await ManualJob.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.company.companyId
        });

        if (!job) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Manual job not found or unauthorized."
            });
        }

        res.status(StatusCodes.OK).json({
            message: "Manual job deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting manual job:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error deleting manual job.",
        });
    }
};




module.exports = {
    saveManualJob,
    getManualJobs,
    getManualJobById,
    updateManualJob,
    deleteManualJob
};
