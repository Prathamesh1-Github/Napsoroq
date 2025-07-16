import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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

const Card = styled.div`
  background: ${props => props.theme.colors.background.card};
  backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 48px;
  width: 100%;
  max-width: 420px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const IconWrapper = styled.div<{ status?: 'default' | 'success' | 'error' }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: ${props => 
    props.status === 'success' ? 'rgba(16, 185, 129, 0.1)' :
    props.status === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(59, 130, 246, 0.1)'
  };
  border: 2px solid ${props => 
    props.status === 'success' ? props.theme.colors.success :
    props.status === 'error' ? props.theme.colors.error :
    props.theme.colors.primary
  };
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.5;
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

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  padding-left: 48px;
  padding-right: 48px;
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

const PasswordStrength = styled.div<{ strength: number }>`
  margin-top: 8px;
  height: 4px;
  background: ${props => props.theme.colors.border.primary};
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.strength}%;
    background: ${props => 
      props.strength < 25 ? props.theme.colors.error :
      props.strength < 50 ? props.theme.colors.warning :
      props.strength < 75 ? '#f59e0b' :
      props.theme.colors.success
    };
    transition: all 0.3s ease;
  }
`;

const PasswordStrengthText = styled.div<{ strength: number }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${props => 
    props.strength < 25 ? props.theme.colors.error :
    props.strength < 50 ? props.theme.colors.warning :
    props.strength < 75 ? '#f59e0b' :
    props.theme.colors.success
  };
`;

const Button = styled.button<{ disabled?: boolean }>`
  width: 100%;
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
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  padding: 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 24px;
  font-size: 14px;
  text-align: center;
  
  ${props => props.type === 'success' && `
    background: rgba(16, 185, 129, 0.1);
    color: ${props.theme.colors.success};
    border: 1px solid rgba(16, 185, 129, 0.3);
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: ${props.theme.colors.error};
    border: 1px solid rgba(239, 68, 68, 0.3);
  `}
`;

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (token) {
            validateToken();
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await fetch(`https://neura-ops.onrender.com/api/v1/auth/validate-reset-token/${token}`, {
                method: 'GET',
            });

            setIsValidToken(response.ok);
        } catch (error) {
            setIsValidToken(false);
        }
    };

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
        return Math.min(strength, 100);
    };

    const getPasswordStrengthText = (strength: number): string => {
        if (strength < 25) return 'Very Weak';
        if (strength < 50) return 'Weak';
        if (strength < 75) return 'Good';
        return 'Strong';
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('https://neura-ops.onrender.com/api/v1/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
            } else {
                setErrors({ general: data.msg || 'Failed to reset password. Please try again.' });
            }
        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'password') {
            setPassword(value);
        } else {
            setConfirmPassword(value);
        }

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (isValidToken === false) {
        return (
            <ThemeProvider theme={theme}>
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card>
                            <Header>
                                <IconWrapper status="error">
                                    <XCircle size={40} color={theme.colors.error} />
                                </IconWrapper>
                                <Title>Invalid Reset Link</Title>
                                <Subtitle>
                                    This password reset link is invalid or has expired. 
                                    Please request a new password reset link.
                                </Subtitle>
                            </Header>

                            <StatusMessage type="error">
                                The reset link may have expired or already been used.
                            </StatusMessage>

                            <Button onClick={() => navigate('/forgot-password')}>
                                Request New Reset Link
                            </Button>
                        </Card>
                    </motion.div>
                </Container>
            </ThemeProvider>
        );
    }

    if (isSuccess) {
        return (
            <ThemeProvider theme={theme}>
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card>
                            <Header>
                                <IconWrapper status="success">
                                    <CheckCircle size={40} color={theme.colors.success} />
                                </IconWrapper>
                                <Title>Password Reset Successful</Title>
                                <Subtitle>
                                    Your password has been successfully reset. 
                                    You can now log in with your new password.
                                </Subtitle>
                            </Header>

                            <StatusMessage type="success">
                                Your password has been updated successfully!
                            </StatusMessage>

                            <Button onClick={() => navigate('/login')}>
                                Continue to Login
                            </Button>
                        </Card>
                    </motion.div>
                </Container>
            </ThemeProvider>
        );
    }

    if (isValidToken === null) {
        return (
            <ThemeProvider theme={theme}>
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card>
                            <Header>
                                <IconWrapper>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Lock size={40} color={theme.colors.primary} />
                                    </motion.div>
                                </IconWrapper>
                                <Title>Validating Reset Link...</Title>
                                <Subtitle>Please wait while we validate your reset link.</Subtitle>
                            </Header>
                        </Card>
                    </motion.div>
                </Container>
            </ThemeProvider>
        );
    }

    const passwordStrength = calculatePasswordStrength(password);

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card>
                        <Header>
                            <IconWrapper>
                                <Lock size={40} color={theme.colors.primary} />
                            </IconWrapper>
                            <Title>Reset Your Password</Title>
                            <Subtitle>
                                Enter your new password below. Make sure it's strong and secure.
                            </Subtitle>
                        </Header>

                        <form onSubmit={handleSubmit}>
                            {errors.general && (
                                <StatusMessage type="error">{errors.general}</StatusMessage>
                            )}

                            <InputGroup>
                                <Label htmlFor="password">New Password</Label>
                                <InputWrapper>
                                    <IconLeft>
                                        <Lock size={18} />
                                    </IconLeft>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        hasError={!!errors.password}
                                        value={password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter your new password"
                                    />
                                    <IconButton
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputWrapper>
                                {password && (
                                    <>
                                        <PasswordStrength strength={passwordStrength} />
                                        <PasswordStrengthText strength={passwordStrength}>
                                            Password strength: {getPasswordStrengthText(passwordStrength)}
                                        </PasswordStrengthText>
                                    </>
                                )}
                                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                            </InputGroup>

                            <InputGroup>
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <InputWrapper>
                                    <IconLeft>
                                        <Lock size={18} />
                                    </IconLeft>
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        hasError={!!errors.confirmPassword}
                                        value={confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder="Confirm your new password"
                                    />
                                    <IconButton
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </IconButton>
                                </InputWrapper>
                                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                            </InputGroup>

                            <motion.div
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            >
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <LoadingSpinner />
                                            </motion.div>
                                            Resetting Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            Reset Password
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </Card>
                </motion.div>
            </Container>
        </ThemeProvider>
    );
};

export default ResetPassword;