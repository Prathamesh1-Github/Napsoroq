import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Loader2, 
    AlertTriangle, 
    Cpu, 
    Database, 
    Package, 
    HandIcon,
    Cylinder,
    ArrowRight, 
    AlertCircle as CircleAlert,
    ChevronDown, 
    ChevronUp,
    Bot as Bottle, 
    FlaskRound as Flask
} from 'lucide-react';


// const Legend: React.FC = () => {
//     return (
//         <div className="flex flex-wrap gap-4 justify-center bg-gray-800/30 rounded-lg p-4 mb-6">
//             <div className="flex items-center gap-2">
//                 <div className="p-1 rounded-md bg-blue-950/40 border border-blue-600/30">
//                     <Database className="w-4 h-4 text-blue-400" />
//                 </div>
//                 <span className="text-sm text-gray-300">Raw material</span>
//             </div>

//             <div className="flex items-center gap-2">
//                 <div className="p-1 rounded-md bg-blue-950/40 border border-blue-600/30">
//                     <Cpu className="w-4 h-4 text-blue-400" />
//                 </div>
//                 <span className="text-sm text-gray-300">Machine</span>
//             </div>

//             <div className="flex items-center gap-2">
//                 <div className="p-1 rounded-md bg-cyan-950/40 border border-cyan-600/30">
//                     <Package className="w-4 h-4 text-cyan-400" />
//                 </div>
//                 <span className="text-sm text-gray-300">Semi-finished</span>
//             </div>

//             <div className="flex items-center gap-2">
//                 <div className="p-1 rounded-md bg-emerald-950/40 border border-emerald-600/30">
//                     <Package className="w-4 h-4 text-emerald-400" />
//                 </div>
//                 <span className="text-sm text-gray-300">End product</span>
//             </div>

//             <div className="flex items-center gap-2">
//                 <div className="p-1 rounded-md bg-purple-950/40 border border-purple-600/30">
//                     <HandIcon className="w-4 h-4 text-purple-400" />
//                 </div>
//                 <span className="text-sm text-gray-300">Manual job</span>
//             </div>
//         </div>
//     );
// };


interface MachineNodeProps {
    name: string;
    status: 'normal' | 'warning' | 'error';
}

const MachineNode: React.FC<MachineNodeProps> = ({ name, status }) => {
    // Determine color based on status
    const getStatusStyle = () => {
        switch (status) {
            case 'warning':
                return 'border-amber-600/50 bg-amber-950/30 text-amber-400';
            case 'error':
                return 'border-red-600/50 bg-red-950/30 text-red-400';
            case 'normal':
            default:
                return 'border-blue-600/50 bg-blue-950/30 text-blue-400';
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
        >
            <div className={`p-4 rounded-lg ${getStatusStyle()} border shadow-lg mb-2`}>
                <div className="relative">
                    <Cpu className="w-10 h-10" />
                    {status === 'warning' && (
                        <div className="absolute -top-2 -right-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>
                    )}
                </div>
            </div>
            <div className="text-xs font-medium text-center max-w-[120px]">
                {name}
            </div>
        </motion.div>
    );
};

interface MaterialNodeProps {
    name: string;
    quantity: string;
}

const MaterialNode: React.FC<MaterialNodeProps> = ({ name, quantity }) => {
    // Determine icon and color based on material name
    const getIconAndColor = () => {
        const nameLower = name.toLowerCase();

        if (nameLower.includes('hdpe') || nameLower.includes('granule')) {
            return {
                icon: <Cylinder className="w-8 h-8" />,
                color: 'text-blue-400 bg-blue-950/40 border-blue-600/30'
            };
        } else if (nameLower.includes('color') || nameLower.includes('masterbatch')) {
            return {
                icon: <Flask className="w-8 h-8" />,
                color: 'text-purple-400 bg-purple-950/40 border-purple-600/30'
            };
        } else if (nameLower.includes('steel') || nameLower.includes('metal')) {
            return {
                icon: <Database className="w-8 h-8" />,
                color: 'text-slate-400 bg-slate-950/40 border-slate-600/30'
            };
        } else {
            return {
                icon: <Package className="w-8 h-8" />,
                color: 'text-amber-400 bg-amber-950/40 border-amber-600/30'
            };
        }
    };

    const { icon, color } = getIconAndColor();

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
        >
            <div className={`p-3 rounded-full ${color} border shadow-lg mb-2 flex items-center justify-center`}>
                {icon}
            </div>
            <div className="text-xs font-medium text-center max-w-[120px]">
                {name}
                {quantity && <div className="text-gray-400">Qty: {quantity}</div>}
            </div>
        </motion.div>
    );
};

const ProcessArrow: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-center h-full"
        >
            <div className="text-gray-600 h-0.5 w-12 bg-gray-700 flex items-center justify-center relative">
                <motion.div
                    initial={{ x: -20 }}
                    animate={{ x: 20 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear"
                    }}
                    className="absolute"
                >
                    <div className="bg-gray-900 px-1">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

interface ProcessStepProps {
    step: Step;
    isLastStep: boolean;
    connections: { from: string; to: string }[];
}

const ProcessStep: React.FC<ProcessStepProps> = ({
    step,
    isLastStep,
}) => {
    // Determine status based on machines or manual jobs
    const hasWarning = step.machines.some(m => m.includes('Warning')) ||
        step.manualJobs.some(j => j.includes('Warning'));

    const status = hasWarning ? 'warning' : 'normal';

    // Generate a unique ID for this step for animation purposes
    const stepId = `step-${step.step}`;

    return (
        <motion.div
            id={stepId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: step.step * 0.1 }}
            className="relative"
        >
            <div className="flex items-start space-x-4 mb-2">
                <div className="text-sm font-medium text-gray-400 py-1 px-2 bg-gray-800/60 rounded">
                    Step {step.step}
                </div>
                {hasWarning && (
                    <div className="flex items-center text-amber-500 text-sm">
                        <CircleAlert size={14} className="mr-1" />
                        Warning
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-start gap-6 py-4">
                {/* Inputs Section */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-gray-400 mb-3">Raw Materials</div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {step.inputs.map((input, idx) => {
                            const [name, qtyStr] = input.split(' (Qty: ');
                            const qty = qtyStr ? qtyStr.replace(')', '') : '1';

                            return (
                                <MaterialNode
                                    key={`${name}-${idx}`}
                                    name={name}
                                    quantity={qty}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:block">
                    <ProcessArrow />
                </div>

                {/* Machines Section */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-gray-400 mb-3">Processing</div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {step.machines.map((machine, idx) => (
                            <MachineNode
                                key={`${machine}-${idx}`}
                                name={machine}
                                status={status}
                            />
                        ))}
                        {step.manualJobs.length > 0 && (
                            <div className="flex flex-col items-center">
                                <div className="p-3 bg-purple-900/30 border border-purple-700/50 rounded-lg mb-2">
                                    <HandIcon className="w-10 h-10 text-purple-400" />
                                </div>
                                <div className="text-xs text-center text-purple-300">
                                    {step.manualJobs.join(', ')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:block">
                    <ProcessArrow />
                </div>

                {/* Output Section */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="text-sm text-gray-400 mb-3">
                        {step.type === 'Product' ? 'End Product' : 'Semi-Finished'}
                    </div>
                    <ProductNode
                        name={step.output}
                        type={step.type}
                    />
                </div>
            </div>

            {!isLastStep && (
                <div className="flex justify-center my-4">
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-1 h-8 bg-gray-700"
                    ></motion.div>
                </div>
            )}

            <div className="text-sm text-gray-500 bg-gray-800/40 p-3 rounded-lg mt-2">
                {step.description}
            </div>
        </motion.div>
    );
};

interface ProductFlowProps {
    flow: Flow;
}

const ProductFlow: React.FC<ProductFlowProps> = ({ flow }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Build a map of steps for easier referencing
    const stepsMap = flow.steps.reduce((acc, step) => {
        acc[step.output] = step;
        return acc;
    }, {} as Record<string, any>);

    // Create connections between steps
    const connections = flow.steps.reduce((acc, step) => {
        step.inputs.forEach(input => {
            // Extract the base name without quantity
            const inputName = input.split(' (')[0];

            // If this input is an output of another step, create a connection
            if (Object.keys(stepsMap).some(output => output === inputName)) {
                acc.push({
                    from: inputName,
                    to: step.output
                });
            }
        });

        return acc;
    }, [] as { from: string; to: string }[]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/40 p-4 rounded-lg border border-gray-700 shadow-lg"
        >
            {/* Header */}
            <div
                className="flex justify-between items-center cursor-pointer p-2 rounded-md hover:bg-gray-700/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-2xl font-bold text-emerald-400">{flow.productName}</h2>
                <div className="text-gray-400">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </div>
            </div>

            {/* Flow Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <div className="py-6 min-w-[800px] grid grid-cols-1 gap-8">
                                {flow.steps.map((step, index) => (
                                    <ProcessStep
                                        key={step.step}
                                        step={step}
                                        isLastStep={index === flow.steps.length - 1}
                                        connections={connections}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface ProductNodeProps {
    name: string;
    type: 'Product' | 'SemiFinishedProduct';
}

const ProductNode: React.FC<ProductNodeProps> = ({ name, type }) => {
    // Determine icon and style based on product type and name
    const getIconAndStyle = () => {
        if (type === 'Product') {
            const nameLower = name.toLowerCase();

            if (nameLower.includes('jar') || nameLower.includes('bottle')) {
                return {
                    icon: <Bottle className="w-10 h-10" />,
                    style: 'text-emerald-400 bg-emerald-950/40 border-emerald-600/30'
                };
            } else {
                return {
                    icon: <Package className="w-10 h-10" />,
                    style: 'text-emerald-400 bg-emerald-950/40 border-emerald-600/30'
                };
            }
        } else {
            return {
                icon: <Flask className="w-10 h-10" />,
                style: 'text-cyan-400 bg-cyan-950/40 border-cyan-600/30'
            };
        }
    };

    const { icon, style } = getIconAndStyle();

    // Calculate random production quantity for demo purposes
    const quantity = type === 'Product'
        ? Math.floor(Math.random() * 1000) + 500
        : Math.floor(Math.random() * 500) + 200;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col items-center"
        >
            <div className={`p-4 rounded-lg ${style} border shadow-lg mb-2`}>
                {icon}
            </div>
            <div className="text-center">
                <div className="text-sm font-medium max-w-[150px] mb-1">{name}</div>
                {type === 'Product' && (
                    <div className="text-lg font-bold text-emerald-400">{quantity} units</div>
                )}
            </div>
        </motion.div>
    );
};

export type Step = {
    step: number;
    output: string;
    type: 'Product' | 'SemiFinishedProduct';
    inputs: string[];
    machines: string[];
    manualJobs: string[];
    description: string;
};

export type Flow = {
    productName: string;
    productId: string;
    steps: Step[];
};

const ManufacturingFlow: React.FC = () => {
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
            .get('https://neura-ops.onrender.com/api/v1/product/manufacturing-flow')
            .then((res) => {
                setFlows(res.data.flows);
                setLoading(false);
            })
            .catch(() => {
                console.error('Error fetching flows');
                setError('Failed to load manufacturing flow data');
                setLoading(false);
            });
    }, []);

    // For development/testing - comment out in production
    useEffect(() => {
        // Simulated data for development
        const mockFlows: Flow[] = [
            {
                productName: "1 Liter Govind Jar",
                productId: "6808bdec3cdf2886b2a81b06",
                steps: [
                    {
                        step: 1,
                        output: "Preform",
                        type: "SemiFinishedProduct",
                        inputs: ["HDPE Granules (Qty: 1)"],
                        machines: ["InjectionMaster 200"],
                        manualJobs: [],
                        description: "Step 1: Used [HDPE Granules (Qty: 1)] to produce \"Preform\" using [InjectionMaster 200]"
                    },
                    {
                        step: 2,
                        output: "1 Liter Govind Jar",
                        type: "Product",
                        inputs: ["Shrink Wrap (Qty: 11)", "Preform (Qty: 1)"],
                        machines: ["BlowPro 5000"],
                        manualJobs: [],
                        description: "Step 2: Used [Shrink Wrap (Qty: 11), Preform (Qty: 1)] to produce \"1 Liter Govind Jar\" using [BlowPro 5000]"
                    }
                ]
            },
            {
                productName: "SONAI 1L Jar",
                productId: "6808d1ff887b1ba9fce3e778",
                steps: [
                    {
                        step: 1,
                        output: "Preform",
                        type: "SemiFinishedProduct",
                        inputs: ["HDPE Granules (Qty: 1)"],
                        machines: ["InjectionMaster 200"],
                        manualJobs: [],
                        description: "Step 1: Used [HDPE Granules (Qty: 1)] to produce \"Preform\" using [InjectionMaster 200]"
                    },
                    {
                        step: 2,
                        output: "SONAI 1L Jar",
                        type: "Product",
                        inputs: ["Color Masterbatch Red (Qty: 1)", "HDPE Granules (Qty: 1)", "Preform (Qty: 1)"],
                        machines: ["ExtrudoMax 300"],
                        manualJobs: ["Labelling"],
                        description: "Step 2: Used [Color Masterbatch Red (Qty: 1), HDPE Granules (Qty: 1), Preform (Qty: 1)] to produce \"SONAI 1L Jar\" using [ExtrudoMax 300 + Labelling]"
                    }
                ]
            }
        ];

        setFlows(mockFlows);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-300">Loading manufacturing flows...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                <p className="text-gray-300">{error}</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {flows.map((flow) => (
                <ProductFlow key={flow.productId} flow={flow} />
            ))}
        </div>
    );
};

export default ManufacturingFlow;