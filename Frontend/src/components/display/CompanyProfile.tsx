import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Building2, 
    Mail, 
    Phone, 
    MapPin, 
    Globe, 
    User, 
    FileText, 
    Shield, 
    Calendar,
    Edit3,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Company {
    _id: string;
    companyName: string;
    email: string;
    industryType: string;
    registrationNumber: string;
    gstNumber: string;
    panNumber: string;
    phone: string;
    address: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    companyLogo?: string;
    website?: string;
    authorizedPerson: {
        name?: string;
        designation?: string;
        email?: string;
        phone?: string;
    };
    isVerified: boolean;
    createdAt: string;
}

interface CompanyProfileProps {
    onBack?: () => void;
}

export function CompanyProfile({ onBack }: CompanyProfileProps) {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState<Partial<Company>>({});

    const fetchCompanyData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('https://neura-ops.onrender.com/api/v1/company', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch company data');
            }

            const data = await response.json();
            setCompany(data.company);
            setEditData(data.company);
        } catch (err: unknown) {
            console.error('Error fetching company data:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('https://neura-ops.onrender.com/api/v1/company', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                throw new Error('Failed to update company profile');
            }

            const data = await response.json();
            setCompany(data.company);
            setEditing(false);
        } catch (err: unknown) {
            console.error('Error updating company profile:', err);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData(company || {});
        setEditing(false);
        setError(null);
    };

    useEffect(() => {
        fetchCompanyData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-lg text-muted-foreground">Loading company profile...</span>
                </div>
            </div>
        );
    }

    if (error && !company) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-destructive mb-4">
                            <AlertCircle className="h-6 w-6" />
                            <span className="font-medium">Error Loading Profile</span>
                        </div>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button onClick={fetchCompanyData} className="w-full">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!company) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-background text-foreground"
        >
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {onBack && (
                                        <Button variant="ghost" size="icon" onClick={onBack}>
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <Building2 className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">Company Profile</CardTitle>
                                            <p className="text-muted-foreground">
                                                Manage your company information and settings
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editing ? (
                                        <>
                                            <Button 
                                                variant="outline" 
                                                onClick={handleCancel}
                                                disabled={saving}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button 
                                                onClick={handleSave}
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setEditing(true)}>
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {error && (
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Company Information */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full bg-background text-foreground border border-border">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <CardTitle>Company Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                    {editing ? (
                                        <Input
                                            value={editData.companyName || ''}
                                            onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                                            placeholder="Enter company name"
                                        />
                                    ) : (
                                        <p className="font-medium">{company.companyName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Industry Type</label>
                                    {editing ? (
                                        <select
                                            value={editData.industryType || ''}
                                            onChange={(e) => setEditData({...editData, industryType: e.target.value})}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="Manufacturing">Manufacturing</option>
                                            <option value="IT">IT</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <Badge variant="outline" className="bg-primary/10 text-primary">
                                            {company.industryType}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                                    {editing ? (
                                        <Input
                                            value={editData.website || ''}
                                            onChange={(e) => setEditData({...editData, website: e.target.value})}
                                            placeholder="https://www.example.com"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <span>{company.website || 'Not provided'}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Verification Status</span>
                                    </div>
                                    <Badge 
                                        variant={company.isVerified ? "default" : "secondary"}
                                        className={company.isVerified ? "bg-emerald-500" : "bg-amber-500"}
                                    >
                                        {company.isVerified ? (
                                            <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verified
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Pending
                                            </>
                                        )}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {format(new Date(company.createdAt), 'MMMM dd, yyyy')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full bg-background text-foreground border border-border">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <CardTitle>Contact Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{company.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    {editing ? (
                                        <Input
                                            value={editData.phone || ''}
                                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{company.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    {editing ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={editData.address?.line1 || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData, 
                                                    address: {...editData.address, line1: e.target.value}
                                                })}
                                                placeholder="Address Line 1"
                                            />
                                            <Input
                                                value={editData.address?.line2 || ''}
                                                onChange={(e) => setEditData({
                                                    ...editData, 
                                                    address: {...editData.address, line2: e.target.value}
                                                })}
                                                placeholder="Address Line 2 (Optional)"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    value={editData.address?.city || ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData, 
                                                        address: {...editData.address, city: e.target.value}
                                                    })}
                                                    placeholder="City"
                                                />
                                                <Input
                                                    value={editData.address?.state || ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData, 
                                                        address: {...editData.address, state: e.target.value}
                                                    })}
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    value={editData.address?.country || ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData, 
                                                        address: {...editData.address, country: e.target.value}
                                                    })}
                                                    placeholder="Country"
                                                />
                                                <Input
                                                    value={editData.address?.postalCode || ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData, 
                                                        address: {...editData.address, postalCode: e.target.value}
                                                    })}
                                                    placeholder="Postal Code"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="text-sm">
                                                <p>{company.address.line1}</p>
                                                {company.address.line2 && <p>{company.address.line2}</p>}
                                                <p>{company.address.city}, {company.address.state}</p>
                                                <p>{company.address.country} - {company.address.postalCode}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Legal Information */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full bg-background text-foreground border border-border">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle>Legal Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">{company.registrationNumber}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">GST Number</label>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">{company.gstNumber}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                                    <p className="font-mono text-sm bg-muted p-2 rounded">{company.panNumber}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Authorized Person */}
                    <motion.div variants={itemVariants}>
                        <Card className="h-full bg-background text-foreground border border-border">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <CardTitle>Authorized Person</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    {editing ? (
                                        <Input
                                            value={editData.authorizedPerson?.name || ''}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                authorizedPerson: {...editData.authorizedPerson, name: e.target.value}
                                            })}
                                            placeholder="Enter name"
                                        />
                                    ) : (
                                        <p className="font-medium">{company.authorizedPerson.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Designation</label>
                                    {editing ? (
                                        <Input
                                            value={editData.authorizedPerson?.designation || ''}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                authorizedPerson: {...editData.authorizedPerson, designation: e.target.value}
                                            })}
                                            placeholder="Enter designation"
                                        />
                                    ) : (
                                        <p>{company.authorizedPerson.designation}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    {editing ? (
                                        <Input
                                            value={editData.authorizedPerson?.email || ''}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                authorizedPerson: {...editData.authorizedPerson, email: e.target.value}
                                            })}
                                            placeholder="Enter email"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{company.authorizedPerson.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    {editing ? (
                                        <Input
                                            value={editData.authorizedPerson?.phone || ''}
                                            onChange={(e) => setEditData({
                                                ...editData, 
                                                authorizedPerson: {...editData.authorizedPerson, phone: e.target.value}
                                            })}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{company.authorizedPerson.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}