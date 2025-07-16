const Invoice = require('../modles/Invoice'); // corrected typo in 'models'

const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ createdBy: req.company.companyId }); // scoped
        res.json(invoices);
    } catch (err) {
        console.error("Error fetching invoices:", err);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
};

const getMonthKey = (date) => date.toISOString().slice(0, 7); // YYYY-MM
const getQuarterKey = (date) => `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
const getYearKey = (date) => date.getFullYear().toString();

const getFinanceChartData = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            createdBy: req.company.companyId, // scoped
            status: { $ne: 'Cancelled' }
        }).sort({ issueDate: 1 });

        if (invoices.length === 0) {
            return res.json({ monthly: [], quarterly: [], yearly: [] });
        }

        const firstInvoiceDate = new Date(invoices[0].issueDate);
        const now = new Date();

        // === Generate recent 12 months ===
        const months = [];
        const startMonth = new Date(firstInvoiceDate.getFullYear(), firstInvoiceDate.getMonth(), 1);
        const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        while (startMonth <= endMonth) {
            months.push(`${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}`);
            startMonth.setMonth(startMonth.getMonth() + 1);
        }

        const recent12Months = months.slice(-12);

        // === Generate recent 4 quarters ===
        const quarters = [];
        const startQuarter = new Date(firstInvoiceDate.getFullYear(), Math.floor(firstInvoiceDate.getMonth() / 3) * 3, 1);
        const endQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

        while (startQuarter <= endQuarter) {
            quarters.push(getQuarterKey(startQuarter));
            startQuarter.setMonth(startQuarter.getMonth() + 3);
        }

        const recent4Quarters = quarters.slice(-4);

        // === Generate recent 5 years ===
        const years = [];
        for (let y = firstInvoiceDate.getFullYear(); y <= now.getFullYear(); y++) {
            years.push(y.toString());
        }

        const recent5Years = years.slice(-5);

        // === Monthly Aggregation ===
        const monthlyMap = {};
        for (const invoice of invoices) {
            const key = getMonthKey(invoice.issueDate);
            monthlyMap[key] = (monthlyMap[key] || 0) + invoice.totalAmount;
        }

        const monthly = recent12Months.map(month => ({
            month,
            revenue: monthlyMap[month] || 0
        }));

        // === Quarterly Aggregation ===
        const quarterMap = {};
        for (const invoice of invoices) {
            const key = getQuarterKey(invoice.issueDate);
            quarterMap[key] = (quarterMap[key] || 0) + invoice.totalAmount;
        }

        const quarterly = recent4Quarters.map(quarter => ({
            quarter,
            revenue: quarterMap[quarter] || 0
        }));

        // === Yearly Aggregation ===
        const yearMap = {};
        for (const invoice of invoices) {
            const key = getYearKey(invoice.issueDate);
            yearMap[key] = (yearMap[key] || 0) + invoice.totalAmount;
        }

        const yearly = recent5Years.map(year => ({
            year,
            revenue: yearMap[year] || 0
        }));

        res.json({ monthly, quarterly, yearly });

    } catch (err) {
        console.error("Invoice sales chart error:", err);
        res.status(500).json({ error: "Failed to generate sales chart data" });
    }
};

module.exports = { getFinanceChartData, getInvoices };
