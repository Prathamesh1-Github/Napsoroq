const { StatusCodes } = require('http-status-codes');
const Company = require('../modles/Company');

const getLoggedInCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.company.companyId).select('-password -emailVerificationToken -passwordResetToken');
        
        if (!company) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: "Company not found" 
            });
        }

        res.status(StatusCodes.OK).json({ 
            success: true, 
            company 
        });
    } catch (error) {
        console.error("Error fetching company data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: "Error fetching company data." 
        });
    }
};

const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.emailVerificationToken;
        delete updateData.passwordResetToken;
        delete updateData._id;

        const company = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -emailVerificationToken -passwordResetToken');

        if (!company) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: "Company not found" 
            });
        }

        res.status(StatusCodes.OK).json({ 
            success: true, 
            message: "Profile updated successfully",
            company 
        });
    } catch (error) {
        console.error("Error updating company profile:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: "Error updating company profile." 
        });
    }
};

module.exports = {
    getLoggedInCompany,
    updateCompanyProfile
};