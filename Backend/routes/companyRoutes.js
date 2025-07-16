const express = require("express");
const router = express.Router();

const {
    getLoggedInCompany,
    updateCompanyProfile
} = require("../controllers/companyController");

// Company profile routes
router.route("/").get(getLoggedInCompany).put(updateCompanyProfile);

module.exports = router;