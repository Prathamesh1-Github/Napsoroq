import { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronUp,
    Settings,
    Clock,
    Zap,
    Search,
    Calendar,
    Filter,
    AlertTriangle,
    Activity,
    Timer,
    TrendingUp
} from "lucide-react";

interface MachineProductionEntry {
    _id: string;
    plannedProductionTime: number;
    actualProductionTime: number;
    totalUnitsProduced: number;
    goodUnitsProduced: number;
    goodUnitsWithoutRework: number;
    scrapUnits: number;
    idealCycleTime: number;
    totalDowntime: number;
    changeoverTime: number;
    actualMachineRunTime: number;
    machineId: string;
    createdAt: string;
    updatedAt: string;
}

interface ProductionsByDate {
    [date: string]: MachineProductionEntry[];
}

export function MachineProductionDisplay() {
    const [productions, setProductions] = useState<ProductionsByDate>({});
    const [filtered, setFiltered] = useState<ProductionsByDate>({});
    const [loading, setLoading] = useState(true);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [machineId, setMachineId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [minScrap, setMinScrap] = useState<string>("");
    const [maxScrap, setMaxScrap] = useState<string>("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchProductions = async () => {
            try {
                const response = await fetch("https://neura-ops.onrender.com/api/v1/production/filtered", {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });
                if (!response.ok) {
                    throw new Error("Failed to fetch machine production data");
                }
                const data = await response.json();
                setProductions(data.productionsByDate);
                setFiltered(data.productionsByDate);
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchProductions();
    }, []);

    useEffect(() => {
        filterData();
    }, [productions, startDate, endDate, machineId, searchTerm, minScrap, maxScrap]);

    const filterData = () => {
        const newFiltered: ProductionsByDate = {};

        for (const [date, entries] of Object.entries(productions)) {
            const dateObj = new Date(date);
            const startDateObj = startDate ? new Date(startDate) : null;
            const endDateObj = endDate ? new Date(endDate) : null;

            if (
                (startDateObj && dateObj < startDateObj) ||
                (endDateObj && dateObj > endDateObj)
            ) continue;

            const filteredEntries = entries.filter(entry => {
                const machineMatch = !machineId || entry.machineId.toLowerCase().includes(machineId.toLowerCase());
                const searchMatch = !searchTerm || entry.machineId.toLowerCase().includes(searchTerm.toLowerCase());
                const minScrapMatch = !minScrap || entry.scrapUnits >= parseInt(minScrap);
                const maxScrapMatch = !maxScrap || entry.scrapUnits <= parseInt(maxScrap);
                return machineMatch && searchMatch && minScrapMatch && maxScrapMatch;
            });

            if (filteredEntries.length > 0) {
                newFiltered[date] = filteredEntries;
            }
        }

        setFiltered(newFiltered);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const toggleDateExpansion = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const calculateEfficiency = (entry: MachineProductionEntry) => {
        if (entry.totalUnitsProduced === 0) return 0;
        return Math.round((entry.goodUnitsProduced / entry.totalUnitsProduced) * 100);
    };

    const calculateOEE = (entry: MachineProductionEntry) => {
        const availability = entry.plannedProductionTime > 0 ?
            ((entry.plannedProductionTime - entry.totalDowntime) / entry.plannedProductionTime) * 100 : 0;
        const performance = entry.actualProductionTime > 0 ?
            (entry.actualMachineRunTime / entry.actualProductionTime) * 100 : 0;
        const quality = entry.totalUnitsProduced > 0 ?
            (entry.goodUnitsProduced / entry.totalUnitsProduced) * 100 : 0;

        return Math.round((availability * performance * quality) / 10000);
    };

    // const getMachineTypeIcon = (machineId: string) => {
    //     if (machineId.startsWith('INJ')) return <Zap className="h-4 w-4" />;
    //     if (machineId.startsWith('BLW')) return <Activity className="h-4 w-4" />;
    //     if (machineId.startsWith('EXT')) return <TrendingUp className="h-4 w-4" />;
    //     return <Settings className="h-4 w-4" />;
    // };

    const getMachineTypeBadge = (machineId: string) => {
        if (machineId.startsWith('INJ')) {
            return (
                <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Injection
                </div>
            );
        }
        if (machineId.startsWith('BLW')) {
            return (
                <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Activity className="h-3 w-3 mr-1" />
                    Blow Molding
                </div>
            );
        }
        if (machineId.startsWith('EXT')) {
            return (
                <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Extrusion
                </div>
            );
        }
        return (
            <div className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white-800">
                <Settings className="h-3 w-3 mr-1" />
                General
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen   flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white-600">Loading machine production data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen   flex items-center justify-center">
                <div className="  p-8 rounded-lg shadow-md max-w-md w-full mx-4">
                    <div className="flex items-center mb-4 text-red-600">
                        <AlertTriangle className="h-6 w-6 mr-2" />
                        <h2 className="text-lg font-semibold">Error</h2>
                    </div>
                    <p className="text-white-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  ">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white-900 mb-2">Machine Production Dashboard</h1>
                    <p className="text-white-600">Monitor and analyze machine performance across all manufacturing operations.</p>
                </div>

                {/* Filters */}
                <div className="  rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Filter className="h-5 w-5 text-white-500 mr-2" />
                        <h2 className="text-lg font-semibold text-white-900">Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Machine ID</label>
                            <div className="relative">
                                <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. INJ-001"
                                    value={machineId}
                                    onChange={(e) => setMachineId(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Search Machine</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white-400" />
                                <input
                                    type="text"
                                    placeholder="Search machine..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Min Scrap Units</label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                value={minScrap}
                                onChange={(e) => setMinScrap(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white-700 mb-2">Max Scrap Units</label>
                            <input
                                type="number"
                                placeholder="e.g. 100"
                                value={maxScrap}
                                onChange={(e) => setMaxScrap(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Production Data */}
                <div className="space-y-6">
                    {Object.keys(filtered).length === 0 ? (
                        <div className="  rounded-lg shadow-sm p-12 text-center">
                            <Settings className="h-16 w-16 text-white-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white-600 mb-2">No Machine Production Data Found</h3>
                            <p className="text-white-500">Try adjusting your filters to see more results.</p>
                        </div>
                    ) : (
                        Object.entries(filtered)
                            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                            .map(([date, entries]) => {
                                const isExpanded = expandedDates.has(date);
                                const totalProduced = entries.reduce((sum, entry) => sum + entry.totalUnitsProduced, 0);
                                const totalGood = entries.reduce((sum, entry) => sum + entry.goodUnitsProduced, 0);
                                const totalScrap = entries.reduce((sum, entry) => sum + entry.scrapUnits, 0);
                                const avgEfficiency = Math.round((totalGood / totalProduced) * 100) || 0;
                                const totalPlannedTime = entries.reduce((sum, entry) => sum + entry.plannedProductionTime, 0);
                                const totalActualTime = entries.reduce((sum, entry) => sum + entry.actualProductionTime, 0);

                                return (
                                    <div key={date} className="  rounded-lg shadow-sm overflow-hidden">
                                        {/* Date Header */}
                                        <div
                                            className="px-6 py-4   border-b cursor-pointer transition-colors"
                                            onClick={() => toggleDateExpansion(date)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-white-500" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-white-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white-900">{formatDate(date)}</h3>
                                                        <p className="text-sm text-white-600">{entries.length} machine production entries</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-6 text-sm">
                                                    <div className="text-center">
                                                        <div className="font-semibold text-white-900">{totalProduced}</div>
                                                        <div className="text-white-500">Total Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-green-600">{totalGood}</div>
                                                        <div className="text-white-500">Good Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-red-600">{totalScrap}</div>
                                                        <div className="text-white-500">Scrap Units</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-blue-600">{avgEfficiency}%</div>
                                                        <div className="text-white-500">Efficiency</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-purple-600">{Math.round(totalPlannedTime)} min</div>
                                                        <div className="text-white-500">Planned Time</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-orange-600">{Math.round(totalActualTime)} min</div>
                                                        <div className="text-white-500">Actual Time</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Production Details */}
                                        {isExpanded && (
                                            <div className="p-6">
                                                {/* Machine Production Entries Table */}
                                                <div className="mb-8">
                                                    <h4 className="text-lg font-semibold text-white-900 mb-4">Machine Production Entries</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className=" ">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Machine Details
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Production Units
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Time Performance
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Efficiency & OEE
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Downtime
                                                                    </th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                                                                        Time
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="  divide-y divide-gray-200">
                                                                {entries.map((entry) => {
                                                                    const efficiency = calculateEfficiency(entry);
                                                                    const oee = calculateOEE(entry);
                                                                    return (
                                                                        <tr key={entry._id} className="hover: ">
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="flex items-center">
                                                                                    <div className="flex-shrink-0">
                                                                                        {getMachineTypeBadge(entry.machineId)}
                                                                                    </div>
                                                                                    <div className="ml-4">
                                                                                        <div className="text-sm font-medium text-white-900">{entry.machineId}</div>
                                                                                        <div className="text-sm text-white-500">Cycle: {entry.idealCycleTime}s</div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="text-sm text-white-900">
                                                                                    <div className="font-medium">Total: {entry.totalUnitsProduced}</div>
                                                                                    <div className="text-green-600">Good: {entry.goodUnitsProduced}</div>
                                                                                    <div className="text-blue-600">No Rework: {entry.goodUnitsWithoutRework}</div>
                                                                                    <div className="text-red-600">Scrap: {entry.scrapUnits}</div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="text-sm text-white-900">
                                                                                    <div>Planned: {Math.round(entry.plannedProductionTime)} min</div>
                                                                                    <div>Actual: {Math.round(entry.actualProductionTime)} min</div>
                                                                                    <div>Run Time: {Math.round(entry.actualMachineRunTime)} min</div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-center">
                                                                                        <div className="text-sm font-medium text-white-900 w-16">Eff: {efficiency}%</div>
                                                                                        <div className="ml-2 w-16   rounded-full h-2">
                                                                                            <div
                                                                                                className={`h-2 rounded-full ${efficiency >= 90 ? 'bg-green-500' :
                                                                                                        efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                                    }`}
                                                                                                style={{ width: `${efficiency}%` }}
                                                                                            ></div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center">
                                                                                        <div className="text-sm font-medium text-white-900 w-16">OEE: {oee}%</div>
                                                                                        <div className="ml-2 w-16   rounded-full h-2">
                                                                                            <div
                                                                                                className={`h-2 rounded-full ${oee >= 85 ? 'bg-green-500' :
                                                                                                        oee >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                                    }`}
                                                                                                style={{ width: `${oee}%` }}
                                                                                            ></div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="text-sm text-white-900">
                                                                                    <div className="flex items-center">
                                                                                        <Timer className="h-4 w-4 mr-1 text-red-500" />
                                                                                        <span>{Math.round(entry.totalDowntime)} min</span>
                                                                                    </div>
                                                                                    <div className="flex items-center mt-1">
                                                                                        <Clock className="h-4 w-4 mr-1 text-orange-500" />
                                                                                        <span>CO: {Math.round(entry.changeoverTime)} min</span>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                                                                                {formatTime(entry.createdAt)}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Performance Summary */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white-900 mb-4 flex items-center">
                                                        <TrendingUp className="h-5 w-5 mr-2" />
                                                        Daily Performance Summary
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="flex items-center">
                                                                <Activity className="h-8 w-8 text-blue-600" />
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-blue-600">Total Production</p>
                                                                    <p className="text-2xl font-bold text-blue-900">{totalProduced}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <div className="flex items-center">
                                                                <Zap className="h-8 w-8 text-green-600" />
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-green-600">Average Efficiency</p>
                                                                    <p className="text-2xl font-bold text-green-900">{avgEfficiency}%</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                            <div className="flex items-center">
                                                                <Clock className="h-8 w-8 text-purple-600" />
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-purple-600">Planned Time</p>
                                                                    <p className="text-2xl font-bold text-purple-900">{Math.round(totalPlannedTime)}m</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-orange-50 p-4 rounded-lg">
                                                            <div className="flex items-center">
                                                                <Timer className="h-8 w-8 text-orange-600" />
                                                                <div className="ml-3">
                                                                    <p className="text-sm font-medium text-orange-600">Actual Time</p>
                                                                    <p className="text-2xl font-bold text-orange-900">{Math.round(totalActualTime)}m</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>
        </div>
    );
}