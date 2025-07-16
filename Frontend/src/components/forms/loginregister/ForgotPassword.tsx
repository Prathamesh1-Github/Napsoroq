import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
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

const IconWrapper = styled.div<{ success?: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: ${props => props.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  border: 2px solid ${props => props.success ? props.theme.colors.success : props.theme.colors.primary};
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

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
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
  margin-bottom: 12px;

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

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
`;

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: ${props => props.theme.colors.success};
  padding: 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  margin-bottom: 24px;
  text-align: center;
`;

const EmailText = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  margin: 16px 0;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  text-align: center;
`;

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('https://neura-ops.onrender.com/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                setError(data.msg || 'Failed to send reset email. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setEmail(value);
        if (error) {
            setError('');
        }
    };

    if (isSubmitted) {
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
                                <IconWrapper success>
                                    <CheckCircle size={40} color={theme.colors.success} />
                                </IconWrapper>
                                <Title>Check Your Email</Title>
                                <Subtitle>
                                    We've sent a password reset link to your email address. 
                                    Please check your inbox and follow the instructions to reset your password.
                                </Subtitle>
                            </Header>

                            <EmailText>{email}</EmailText>

                            <SuccessMessage>
                                If you don't see the email, please check your spam folder.
                            </SuccessMessage>

                            <Button variant="secondary" onClick={() => navigate('/login')}>
                                <ArrowLeft size={16} />
                                Back to Login
                            </Button>
                        </Card>
                    </motion.div>
                </Container>
            </ThemeProvider>
        );
    }

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
                                <Mail size={40} color={theme.colors.primary} />
                            </IconWrapper>
                            <Title>Forgot Password?</Title>
                            <Subtitle>
                                Enter your email address and we'll send you a link to reset your password.
                            </Subtitle>
                        </Header>

                        <form onSubmit={handleSubmit}>
                            <InputGroup>
                                <Label htmlFor="email">Email Address</Label>
                                <InputWrapper>
                                    <IconLeft>
                                        <Mail size={18} />
                                    </IconLeft>
                                    <Input
                                        id="email"
                                        type="email"
                                        hasError={!!error}
                                        value={email}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder="Enter your email address"
                                        autoComplete="email"
                                    />
                                </InputWrapper>
                                {error && <ErrorMessage>{error}</ErrorMessage>}
                            </InputGroup>

                            <motion.div
                                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            >
                                <Button type="submit" variant="primary" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <LoadingSpinner />
                                            </motion.div>
                                            Sending Reset Link...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={16} />
                                            Send Reset Link
                                        </>
                                    )}
                                </Button>
                            </motion.div>

                            <Button variant="secondary" onClick={() => navigate('/login')}>
                                <ArrowLeft size={16} />
                                Back to Login
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </Container>
        </ThemeProvider>
    );
};

export default ForgotPassword;