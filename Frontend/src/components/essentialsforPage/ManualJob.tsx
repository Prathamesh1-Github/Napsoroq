import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Package,
    Search,
    Wrench,
    DollarSign,
    Timer,
    Users,
    Settings,
    ClipboardList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ManualJob {
    _id: string;
    jobName: string;
    department: string;
    jobType: string;
    manualJobCategory: string;
    jobDescription: string;
    estimatedDuration: number;
    inputType: string;
    inputPerUnit: number;
    inputUnitOfMeasure: string;
    rawMaterials: Array<{
        rawMaterialId: string;
        rawMaterialName: string;
    }>;
    minimumWorkersRequired: number;
    costType: string;
    costPerUnit?: number;
    hourlyCostRate?: number;
    fixedCostPerDay?: number;
}

interface ManualJobDashboardProps {
    manualJobs: ManualJob[];
}

export function ManualJobDashboard({ manualJobs = [] }: ManualJobDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredJobs = manualJobs.filter((job) =>
        job.jobName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCostDisplay = (job: ManualJob) => {
        switch (job.costType) {
            case 'Per Unit':
                return `$${job.costPerUnit}/unit`;
            case 'Hourly':
                return `$${job.hourlyCostRate}/hour`;
            case 'Fixed':
                return `$${job.fixedCostPerDay}/day`;
            default:
                return 'N/A';
        }
    };

    return (
        <div className="container w-screen mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manual Jobs</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and monitor your manual jobs
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search jobs..."
                            className="pl-10 w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="font-semibold">
                        {manualJobs.length} Total Jobs
                    </Badge>
                </div>
            </div>

            <AnimatePresence>
                {filteredJobs.map((job: ManualJob, index: number) => (
                    <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Wrench className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{job.jobName}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                {/* Building2 className="h-4 w-4" */}
                                                {job.department}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-medium">
                                            {job.jobType}
                                        </Badge>
                                        <Badge variant="secondary" className="font-medium">
                                            {job.manualJobCategory}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Timer className="h-4 w-4 text-muted-foreground" />
                                            <span>Estimated Duration: {job.estimatedDuration} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>Minimum Workers: {job.minimumWorkersRequired}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span>Cost: {getCostDisplay(job)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Input Details
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>Type: {job.inputType}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>Per Unit: {job.inputPerUnit} {job.inputUnitOfMeasure}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {job.rawMaterials && job.rawMaterials.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                Required Raw Materials
                                            </h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Material ID</TableHead>
                                                        <TableHead>Material Name</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {job.rawMaterials.map((material) => (
                                                        <TableRow key={material.rawMaterialId}>
                                                            <TableCell className="font-medium">
                                                                {material.rawMaterialId}
                                                            </TableCell>
                                                            <TableCell>
                                                                {material.rawMaterialName}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                )}

                                {job.jobDescription && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <ClipboardList className="h-4 w-4" />
                                                Job Description
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {job.jobDescription}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
} 
