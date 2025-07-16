import { useState, useEffect } from "react";
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
    Cell,
} from "recharts";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

export default function BottleneckDashboard() {
    const [machineData, setMachineData] = useState([]);
    const [jobData, setJobData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => new Date());
    const [endDate, setEndDate] = useState(() => new Date());
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [selectedMachine, setSelectedMachine] = useState<any | null>(null);


const [aiInsight, setAiInsight] = useState<any[]>([]);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState<string | null>(null);


const fetchAiInsight = async () => {
    try {
        setAiLoading(true);
        setAiError(null);
        setAiInsight([]);

        const res = await axios.get("https://neura-ops.onrender.com/api/v1/ai/bottleneck-insight",
            {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
        );

        if (!res.data.success || !res.data.data) {
            setAiError("AI response is missing or unsuccessful.");
            return;
        }

        // Strip markdown formatting (```json\n...\n```)
        const rawText = res.data.data;
        const cleanedText = rawText
            .replace(/^```json\\n?/, '')
            .replace(/\\n?```$/, '')
            .replace(/```json\n/, '')
            .replace(/\n```/, '')
            .trim();

        const parsed = JSON.parse(cleanedText);
        const insights = Array.isArray(parsed)
            ? parsed
            : parsed.insights || [];

        if (!Array.isArray(insights)) {
            setAiError("AI insight format is invalid.");
            return;
        }

        setAiInsight(insights);
    } catch (err) {
        console.error("Error parsing AI insights:", err);
        setAiError("Failed to parse or fetch AI insights.");
    } finally {
        setAiLoading(false);
    }
};



    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
  "https://neura-ops.onrender.com/api/v1/productionoutput/bottlenecks",
  {
    params: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  }
);

            setMachineData(res.data.machineBottlenecks);
            setJobData(res.data.manualJobBottlenecks);
        } catch (error) {
            console.error("Error fetching bottlenecks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <p>Loading bottleneck analysis...</p>;

    return (
        <div className="p-6">
            <div className="flex gap-4 mb-6">
                <div>
                    <label className="block text-sm">Start Date</label>
                    <input
                        type="date"
                        value={startDate.toISOString().slice(0, 10)}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="border px-2 py-1 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm">End Date</label>
                    <input
                        type="date"
                        value={endDate.toISOString().slice(0, 10)}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="border px-2 py-1 rounded"
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="bg-blue-600 text-white px-4 py-2 rounded self-end"
                >
                    Apply
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>🛠 Machine Bottlenecks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={machineData}>
                                <XAxis
                                    dataKey={(d) =>
                                        d.machineDetails?.machineName || d._id
                                    }
                                    angle={-20}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="totalDowntime"
                                    fill="#ef4444"
                                    name="Total Downtime"
                                    onClick={(entry) => setSelectedMachine(entry)}
                                >
                                    <LabelList dataKey="totalDowntime" position="top" />
                                </Bar>
                                <Bar
                                    dataKey="avgChangeoverTime"
                                    fill="#f59e0b"
                                    name="Avg Changeover"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🧑‍🏭 Manual Job Bottlenecks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={jobData}>
                                <XAxis
                                    dataKey={(d) =>
                                        d.jobDetails?.jobName || d._id
                                    }
                                    angle={-20}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="avgTimePerUnit"
                                    name="Avg Time/Unit"
                                    onClick={(entry) => setSelectedJob(entry)}
                                >
                                    {jobData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avgTimePerUnit > 15 ? "#dc2626" : "#3b82f6"} />
                                    ))}
                                    <LabelList dataKey="avgTimePerUnit" position="top" />
                                </Bar>
                                <Bar dataKey="totalScrap" fill="#6366f1" name="Scrap" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* MODALS */}
            {selectedJob && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="  p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-semibold mb-2">
                            🧪 {selectedJob.jobDetails?.jobName}
                        </h2>
                        <p><b>Avg Time/Unit:</b> {selectedJob.avgTimePerUnit.toFixed(2)} min</p>
                        <p><b>Total Scrap:</b> {selectedJob.totalScrap}</p>
                        <p><b>Total Output:</b> {selectedJob.totalOutput}</p>
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {selectedMachine && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="  p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-semibold mb-2">
                            ⚙️ {selectedMachine.machineDetails?.machineName}
                        </h2>
                        <p><b>Total Downtime:</b> {selectedMachine.totalDowntime} min</p>
                        <p><b>Avg Changeover Time:</b> {selectedMachine.avgChangeoverTime.toFixed(2)} min</p>
                        <p><b>Avg Run Time:</b> {selectedMachine.avgRunTime.toFixed(2)} min</p>
                        <button
                            onClick={() => setSelectedMachine(null)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

<button
    onClick={fetchAiInsight}
    className="bg-purple-600 text-white px-4 py-2 rounded self-end"
>
    {aiLoading ? "Loading AI Insights..." : "Get AI Insights"}
</button>

{aiLoading && (
    <p className="mt-4 text-purple-600 font-semibold">Fetching AI insights...</p>
)}

{aiError && (
    <p className="mt-4 text-red-600 font-semibold">{aiError}</p>
)}

{aiInsight.length > 0 && (
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">🤖 AI Bottleneck Insights</h2>
        <div className="space-y-4">
            {aiInsight.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4 shadow-md  ">
                    <h3 className="text-xl font-semibold">{insight.title}</h3>
                    <p className="text-white-700 mt-1">{insight.narrative}</p>
                    <ul className="text-sm text-white-600 mt-2 space-y-1">
                        <li><b>Modules:</b> {insight.affectedModules?.join(", ")}</li>
                        <li><b>Problem:</b> {insight.problem}</li>
                        <li><b>Root Cause:</b> {insight.rootCause}</li>
                        <li><b>Recommendation:</b> {insight.recommendation}</li>
                        <li><b>Impact:</b> {insight.impact}</li>
                        <li><b>Risk Level:</b> <span className={`font-bold ${
                            insight.riskLevel === "High" ? "text-red-600" :
                            insight.riskLevel === "Medium" ? "text-yellow-600" :
                            "text-green-600"
                        }`}>{insight.riskLevel}</span></li>
                    </ul>
                </div>
            ))}
        </div>
    </div>
)}


        </div>
    );
}
