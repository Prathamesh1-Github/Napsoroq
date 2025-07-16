const Machine = require('../modles/Machine');

const { StatusCodes } = require('http-status-codes');

const moment = require('moment');

const saveMachineData = async (req, res) => {
    try {
        const machinePayload = {
            ...req.body,
            createdBy: req.company.companyId
        };

        const machineData = await Machine.create(machinePayload);
        res.status(StatusCodes.CREATED).json({ machineData });
    } catch (error) {
        console.error("Error saving machine data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving machine data." });
    }
};

const getMachineData = async (req, res) => {
    try {
        const machines = await Machine.find({ createdBy: req.company.companyId })
            .sort({ createdAt: -1 });
        res.status(StatusCodes.OK).json({ machines });
    } catch (error) {
        console.error("Error fetching machine data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error fetching machine data." });
    }
};


const getMachineStatus = async (req, res) => {
    try {
        const companyId = req.company.companyId;
        const machines = await Machine.find({ createdBy: companyId }).lean();

        const now = moment();

        const machineStatusData = machines.map((machine) => {
            const {
                machineName,
                oee,
                nextScheduledMaintenanceDate,
                unplannedDowntime = 0,
                machineDowntime = 0,
                availableMachineTime = 0,
            } = machine;

            // Maintenance due calculation
            const daysToMaintenance = moment(nextScheduledMaintenanceDate).diff(now, "days");

            // Uptime calculation based on availableMachineTime vs downtime
            let uptimePercent = "N/A";
            if (availableMachineTime && machineDowntime >= 0) {
                const uptime = Math.max(0, (availableMachineTime - machineDowntime) / availableMachineTime);
                uptimePercent = `${(uptime * 100).toFixed(1)}%`;
            } else if (oee) {
                uptimePercent = `${oee.toFixed(1)}%`;
            }

            // Status classification
            let status = "Running";
            let alert = false;
            let issues = [];

            if (daysToMaintenance <= 3) {
                status = "Maintenance Due";
                alert = true;
                issues.push("Maintenance due soon");
            }

            if (unplannedDowntime > 30) {
                status = "Unstable";
                alert = true;
                issues.push("High unplanned downtime");
            }

            if (oee < 60) {
                status = "Underperforming";
                alert = true;
                issues.push("Low OEE");
            }

            if (!alert && status === "Running" && oee >= 85 && daysToMaintenance > 7) {
                status = "Optimal";
            }

            return {
                name: machineName,
                status,
                uptime: uptimePercent,
                alert,
                issues,
            };
        });

        res.status(200).json({ machines: machineStatusData });
    } catch (error) {
        console.error("Error fetching machine status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {
    saveMachineData,
    getMachineData,
    getMachineStatus
};

