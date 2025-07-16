import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
        card: '0 20px 60px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
        md: '12px',
        xl: '24px'
    }
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.background.card};
  backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 48px;
  width: 100%;
  max-width: 420px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LoginTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const LoginSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
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

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean; hasIcon?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  padding-left: ${props => props.hasIcon ? '48px' : '16px'};
  padding-right: ${props => props.hasIcon ? '48px' : '16px'};
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

const IconLeft = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
`;

const Button = styled.button<{ disabled?: boolean }>`
  width: 100%;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  border: none;
  opacity: ${props => props.disabled ? 0.6 : 1};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
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
  margin: 0 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const SecurityBadge = styled.div`
  margin-top: 32px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;

  p {
    color: ${props => props.theme.colors.primary};
    font-size: 12px;
    font-weight: 500;
    margin: 0;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
`;

interface LoginFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (field: keyof LoginFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loginUser = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('https://neura-ops.onrender.com/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.company) {
                if (!data.company.isVerified) {
                    alert('Please verify your email before logging in. Check your inbox for verification link.');
                    navigate('/verify-email', { state: { email: formData.email } });
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('company', JSON.stringify(data.company));
                localStorage.setItem("isLoggedIn", "true");
                navigate('/companyprofile');
            } else {
                setErrors({ general: data.msg || 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, delay: 0.2 }
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <LoginCard>
                        <LoginHeader>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            >
                                <Building2 size={48} color={theme.colors.primary} style={{ margin: '0 auto 16px' }} />
                            </motion.div>
                            <LoginTitle>Welcome Back</LoginTitle>
                            <LoginSubtitle>Sign in to your company account</LoginSubtitle>
                        </LoginHeader>

                        <motion.form
                            onSubmit={loginUser}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {errors.general && (
                                <ErrorMessage style={{ marginBottom: '16px', textAlign: 'center' }}>
                                    {errors.general}
                                </ErrorMessage>
                            )}

                            <InputGroup>
                                <Label htmlFor="email">Email Address</Label>
                                <InputWrapper>
                                    <IconLeft>
                                        <Mail size={18} />
                                    </IconLeft>
                                    <Input
                                        id="email"
                                        type="email"
                                        hasError={!!errors.email}
                                        hasIcon={true}
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter your email address"
                                        autoComplete="email"
                                    />
                                </InputWrapper>
                                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                            </InputGroup>

                            <InputGroup>
                                <Label htmlFor="password">Password</Label>
                                <InputWrapper>
                                    <IconLeft>
                                        <Lock size={18} />
                                    </IconLeft>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        hasError={!!errors.password}
                                        hasIcon={true}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />
                                    <IconButton
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputWrapper>
                                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                            </InputGroup>

                            <motion.div
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            >
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <LoadingSpinner />
                                        </motion.div>
                                    ) : (
                                        <>
                                            <LogIn size={16} />
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </motion.form>

                        <FormFooter>
                            <FooterText>
                                Don't have an account?
                                <FooterLink onClick={() => navigate('/register')}>
                                    Create company account
                                </FooterLink>
                            </FooterText>
                            <FooterText>
                                <FooterLink onClick={() => navigate('/forgot-password')}>
                                    Forgot your password?
                                </FooterLink>
                            </FooterText>
                        </FormFooter>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <SecurityBadge>
                                <p>🔒 Your data is encrypted and secure</p>
                            </SecurityBadge>
                        </motion.div>
                    </LoginCard>
                </motion.div>
            </Container>
        </ThemeProvider>
    );
};

export default Login;