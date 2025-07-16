import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, ArrowLeft, Check, MapPin, FileText } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        primary: '#3b82f6',
        primaryDark: '#1d4ed8',
        secondary: '#f3f4f6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        text: {
            primary: 'var(--text-primary, #1f2937)',
            secondary: 'var(--text-secondary, #6b7280)',
            muted: 'var(--text-muted, #9ca3af)'
        },
        background: {
            primary: 'var(--bg-primary, #ffffff)',
            secondary: 'var(--bg-secondary, #f8fafc)',
            card: 'var(--bg-card, rgba(255, 255, 255, 0.95))',
            input: 'var(--bg-input, #ffffff)'
        },
        border: {
            primary: 'var(--border-primary, #e5e7eb)',
            focus: 'var(--border-focus, #3b82f6)',
            error: 'var(--border-error, #ef4444)'
        }
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        card: '0 20px 60px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px'
    }
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 48px;
  background: ${props => props.theme.colors.background.card};
  backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressBar = styled.div`
  height: 6px;
  background: ${props => props.theme.colors.border.primary};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 32px;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  gap: 12px;
`;

const StepDot = styled.div<{ active?: boolean; completed?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props =>
        props.completed ? props.theme.colors.success :
            props.active ? props.theme.colors.primary :
                props.theme.colors.border.primary
    };
  transition: all 0.2s ease;
  transform: ${props => props.active ? 'scale(1.2)' : 'scale(1)'};
`;

const StepHeader = styled.div`
  margin-bottom: 24px;
`;

const StepTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const StepSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const FormStep = styled.div`
  min-height: 400px;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 6px;
  font-size: 14px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? props.theme.colors.border.error : props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.background.input};
  color: ${props => props.theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? props.theme.colors.border.error : props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  background: ${props => props.theme.colors.background.input};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: none;
  opacity: ${props => props.disabled ? 0.6 : 1};

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, ${props.theme.colors.primary} 0%, ${props.theme.colors.primaryDark} 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: ${props.theme.colors.secondary};
    color: ${props.theme.colors.text.primary};
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.border.primary};
    }
  `}
`;

const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  .full-width {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const FormFooter = styled.div`
  text-align: center;
  margin-top: 24px;
`;

const FooterText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

interface FormData {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
    industryType: string;
    registrationNumber: string;
    gstNumber: string;
    panNumber: string;
    phone: string;
    address: {
        line1: string;
        line2: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    companyLogo: string;
    website: string;
    authorizedPerson: {
        name: string;
        designation: string;
        email: string;
        phone: string;
    };
}

interface FormErrors {
    [key: string]: string;
}

const CompanyRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<FormData>({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
        industryType: 'Other',
        registrationNumber: '',
        gstNumber: '',
        panNumber: '',
        phone: '',
        address: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: 'India',
            postalCode: ''
        },
        companyLogo: '',
        website: '',
        authorizedPerson: {
            name: '',
            designation: '',
            email: '',
            phone: ''
        }
    });

    const totalSteps = 3;

    const validateStep = (step: number): boolean => {
        const newErrors: FormErrors = {};

        if (step === 1) {
            if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
            if (!formData.industryType) newErrors.industryType = 'Industry type is required';
        }

        if (step === 2) {
            if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
            if (!formData.gstNumber.trim()) newErrors.gstNumber = 'GST number is required';
            if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/.test(formData.gstNumber)) {
                newErrors.gstNumber = 'Invalid GST number format';
            }
            if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                newErrors.panNumber = 'Invalid PAN number format';
            }
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
            if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
        }

        if (step === 3) {
            if (!formData.address.line1.trim()) newErrors['address.line1'] = 'Address line 1 is required';
            if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
            if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
            if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required';
            if (!formData.address.postalCode.trim()) newErrors['address.postalCode'] = 'Postal code is required';
            if (!/^\d{5,6}$/.test(formData.address.postalCode)) newErrors['address.postalCode'] = 'Invalid postal code';

            if (!formData.authorizedPerson.name.trim()) newErrors['authorizedPerson.name'] = 'Authorized person name is required';
            if (!formData.authorizedPerson.designation.trim()) newErrors['authorizedPerson.designation'] = 'Designation is required';
            if (!formData.authorizedPerson.email.trim()) newErrors['authorizedPerson.email'] = 'Authorized email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorizedPerson.email)) {
                newErrors['authorizedPerson.email'] = 'Invalid email format';
            }
            if (!formData.authorizedPerson.phone.trim()) newErrors['authorizedPerson.phone'] = 'Authorized phone is required';
            if (!/^\d{10}$/.test(formData.authorizedPerson.phone)) {
                newErrors['authorizedPerson.phone'] = 'Phone number must be 10 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string) => {
        const fields = field.split('.');
        if (fields.length === 1) {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else if (fields.length === 2) {
            setFormData(prev => ({
                ...prev,
                [fields[0]]: {
                    ...prev[fields[0] as keyof FormData] as any,
                    [fields[1]]: value
                }
            }));
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsLoading(true);
        try {
            const submitData = { ...formData };
            delete (submitData as any).confirmPassword;

            const response = await axios.post('https://neura-ops.onrender.com/api/v1/auth/register', submitData);

            if (response.data) {
                alert('Registration successful! Please check your email for verification link.');
                navigate('/verify-email', { state: { email: formData.email } });
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            alert(error.response?.data?.msg || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const industryOptions = ['Manufacturing', 'IT', 'Healthcare', 'Logistics', 'Retail', 'Other'];

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    const renderStep1 = () => (
        <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <FormStep>
                <StepHeader>
                    <Building2 size={32} color={theme.colors.primary} style={{ marginBottom: '16px' }} />
                    <StepTitle>Company Information</StepTitle>
                    <StepSubtitle>Let's start with your basic company details</StepSubtitle>
                </StepHeader>

                <InputGroup>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                        id="companyName"
                        type="text"
                        hasError={!!errors.companyName}
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter your company name"
                    />
                    {errors.companyName && <ErrorMessage>{errors.companyName}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <Label htmlFor="email">Company Email Address *</Label>
                    <Input
                        id="email"
                        type="email"
                        hasError={!!errors.email}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your company email address"
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </InputGroup>

                <GridTwo>
                    <InputGroup>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            hasError={!!errors.password}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Create a strong password"
                        />
                        {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            hasError={!!errors.confirmPassword}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                    </InputGroup>
                </GridTwo>

                <InputGroup>
                    <Label htmlFor="industryType">Industry Type *</Label>
                    <Select
                        id="industryType"
                        hasError={!!errors.industryType}
                        value={formData.industryType}
                        onChange={(e) => handleInputChange('industryType', e.target.value)}
                    >
                        {industryOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </Select>
                    {errors.industryType && <ErrorMessage>{errors.industryType}</ErrorMessage>}
                </InputGroup>
            </FormStep>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <FormStep>
                <StepHeader>
                    <FileText size={32} color={theme.colors.primary} style={{ marginBottom: '16px' }} />
                    <StepTitle>Legal Information</StepTitle>
                    <StepSubtitle>Provide your company's legal registration details</StepSubtitle>
                </StepHeader>

                <InputGroup>
                    <Label htmlFor="registrationNumber">Registration Number *</Label>
                    <Input
                        id="registrationNumber"
                        type="text"
                        hasError={!!errors.registrationNumber}
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        placeholder="Enter registration number"
                    />
                    {errors.registrationNumber && <ErrorMessage>{errors.registrationNumber}</ErrorMessage>}
                </InputGroup>

                <GridTwo>
                    <InputGroup>
                        <Label htmlFor="gstNumber">GST Number *</Label>
                        <Input
                            id="gstNumber"
                            type="text"
                            hasError={!!errors.gstNumber}
                            value={formData.gstNumber}
                            onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                        />
                        {errors.gstNumber && <ErrorMessage>{errors.gstNumber}</ErrorMessage>}
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="panNumber">PAN Number *</Label>
                        <Input
                            id="panNumber"
                            type="text"
                            hasError={!!errors.panNumber}
                            value={formData.panNumber}
                            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                            placeholder="AAAAA0000A"
                            maxLength={10}
                        />
                        {errors.panNumber && <ErrorMessage>{errors.panNumber}</ErrorMessage>}
                    </InputGroup>
                </GridTwo>

                <InputGroup>
                    <Label htmlFor="phone">Contact Number *</Label>
                    <Input
                        id="phone"
                        type="tel"
                        hasError={!!errors.phone}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        maxLength={10}
                    />
                    {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.company.com"
                    />
                </InputGroup>
            </FormStep>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <FormStep>
                <StepHeader>
                    <MapPin size={32} color={theme.colors.primary} style={{ marginBottom: '16px' }} />
                    <StepTitle>Address & Contact Person</StepTitle>
                    <StepSubtitle>Complete your registration with address and authorized person details</StepSubtitle>
                </StepHeader>

                <div style={{ marginBottom: '32px' }}>
                    <SectionTitle>Company Address</SectionTitle>

                    <AddressGrid>
                        <InputGroup className="full-width">
                            <Label htmlFor="addressLine1">Address Line 1 *</Label>
                            <Input
                                id="addressLine1"
                                type="text"
                                hasError={!!errors['address.line1']}
                                value={formData.address.line1}
                                onChange={(e) => handleInputChange('address.line1', e.target.value)}
                                placeholder="Street address, building, etc."
                            />
                            {errors['address.line1'] && <ErrorMessage>{errors['address.line1']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup className="full-width">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input
                                id="addressLine2"
                                type="text"
                                value={formData.address.line2}
                                onChange={(e) => handleInputChange('address.line2', e.target.value)}
                                placeholder="Apartment, suite, unit, etc. (optional)"
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                type="text"
                                hasError={!!errors['address.city']}
                                value={formData.address.city}
                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                placeholder="City"
                            />
                            {errors['address.city'] && <ErrorMessage>{errors['address.city']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                type="text"
                                hasError={!!errors['address.state']}
                                value={formData.address.state}
                                onChange={(e) => handleInputChange('address.state', e.target.value)}
                                placeholder="State"
                            />
                            {errors['address.state'] && <ErrorMessage>{errors['address.state']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="country">Country *</Label>
                            <Input
                                id="country"
                                type="text"
                                hasError={!!errors['address.country']}
                                value={formData.address.country}
                                onChange={(e) => handleInputChange('address.country', e.target.value)}
                                placeholder="Country"
                            />
                            {errors['address.country'] && <ErrorMessage>{errors['address.country']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="postalCode">Postal Code *</Label>
                            <Input
                                id="postalCode"
                                type="text"
                                hasError={!!errors['address.postalCode']}
                                value={formData.address.postalCode}
                                onChange={(e) => handleInputChange('address.postalCode', e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                maxLength={6}
                            />
                            {errors['address.postalCode'] && <ErrorMessage>{errors['address.postalCode']}</ErrorMessage>}
                        </InputGroup>
                    </AddressGrid>
                </div>

                <div>
                    <SectionTitle>Authorized Person</SectionTitle>

                    <AddressGrid>
                        <InputGroup>
                            <Label htmlFor="authorizedName">Full Name *</Label>
                            <Input
                                id="authorizedName"
                                type="text"
                                hasError={!!errors['authorizedPerson.name']}
                                value={formData.authorizedPerson.name}
                                onChange={(e) => handleInputChange('authorizedPerson.name', e.target.value)}
                                placeholder="Full name"
                            />
                            {errors['authorizedPerson.name'] && <ErrorMessage>{errors['authorizedPerson.name']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="designation">Designation *</Label>
                            <Input
                                id="designation"
                                type="text"
                                hasError={!!errors['authorizedPerson.designation']}
                                value={formData.authorizedPerson.designation}
                                onChange={(e) => handleInputChange('authorizedPerson.designation', e.target.value)}
                                placeholder="CEO, Director, etc."
                            />
                            {errors['authorizedPerson.designation'] && <ErrorMessage>{errors['authorizedPerson.designation']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="authorizedEmail">Email *</Label>
                            <Input
                                id="authorizedEmail"
                                type="email"
                                hasError={!!errors['authorizedPerson.email']}
                                value={formData.authorizedPerson.email}
                                onChange={(e) => handleInputChange('authorizedPerson.email', e.target.value)}
                                placeholder="person@company.com"
                            />
                            {errors['authorizedPerson.email'] && <ErrorMessage>{errors['authorizedPerson.email']}</ErrorMessage>}
                        </InputGroup>

                        <InputGroup>
                            <Label htmlFor="authorizedPhone">Phone *</Label>
                            <Input
                                id="authorizedPhone"
                                type="tel"
                                hasError={!!errors['authorizedPerson.phone']}
                                value={formData.authorizedPerson.phone}
                                onChange={(e) => handleInputChange('authorizedPerson.phone', e.target.value.replace(/\D/g, ''))}
                                placeholder="9876543210"
                                maxLength={10}
                            />
                            {errors['authorizedPerson.phone'] && <ErrorMessage>{errors['authorizedPerson.phone']}</ErrorMessage>}
                        </InputGroup>
                    </AddressGrid>
                </div>
            </FormStep>
        </motion.div>
    );

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <FormCard>
                    <ProgressBar>
                        <ProgressFill width={(currentStep / totalSteps) * 100} />
                    </ProgressBar>

                    <StepIndicator>
                        {[1, 2, 3].map((step) => (
                            <StepDot
                                key={step}
                                active={step === currentStep}
                                completed={step < currentStep}
                            />
                        ))}
                    </StepIndicator>

                    <AnimatePresence mode="wait">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                    </AnimatePresence>

                    <ButtonGroup>
                        <Button
                            variant="secondary"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
                        >
                            <ArrowLeft size={16} />
                            Previous
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button variant="primary" onClick={nextStep}>
                                Next
                                <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Registering...' : (
                                    <>
                                        <Check size={16} />
                                        Complete Registration
                                    </>
                                )}
                            </Button>
                        )}
                    </ButtonGroup>

                    <FormFooter>
                        <FooterText>Already have an account?</FooterText>
                        <FooterLink onClick={() => navigate('/login')}>
                            Sign in here
                        </FooterLink>
                    </FormFooter>
                </FormCard>
            </Container>
        </ThemeProvider>
    );
};

export default CompanyRegistration;