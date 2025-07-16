import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  text-align: center;
`;

const IconWrapper = styled.div<{ status?: 'pending' | 'success' | 'error' | 'verifying' }>`
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
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const EmailText = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 24px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; disabled?: boolean }>`
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
  margin: 0 4px;

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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
  
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
  
  ${props => props.type === 'info' && `
    background: rgba(59, 130, 246, 0.1);
    color: ${props.theme.colors.primary};
    border: 1px solid rgba(59, 130, 246, 0.3);
  `}
`;

const EmailVerification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    const email = location.state?.email || '';
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const verifyEmail = async (verificationToken: string) => {
        setStatus('verifying');
        try {
            const response = await fetch(`https://neura-ops.onrender.com/api/v1/auth/verify-email?token=${verificationToken}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in to your account.');
            } else {
                setStatus('error');
                setMessage(data.msg || 'Email verification failed. The link may be expired or invalid.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('An error occurred during verification. Please try again.');
        }
    };

    const resendVerificationEmail = async () => {
        if (!email || !canResend) return;

        setIsResending(true);
        try {
            const response = await fetch('https://neura-ops.onrender.com/api/v1/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Verification email has been resent! Please check your inbox.');
                setCanResend(false);
                setCountdown(60); // 60 second cooldown
            } else {
                setMessage(data.msg || 'Failed to resend verification email.');
            }
        } catch (error) {
            setMessage('An error occurred while resending the email.');
        } finally {
            setIsResending(false);
        }
    };

    const renderIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle size={40} color={theme.colors.success} />;
            case 'error':
                return <XCircle size={40} color={theme.colors.error} />;
            case 'verifying':
                return (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <RefreshCw size={40} color={theme.colors.primary} />
                    </motion.div>
                );
            default:
                return <Mail size={40} color={theme.colors.primary} />;
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <>
                        <Title>Verifying Email...</Title>
                        <Subtitle>Please wait while we verify your email address.</Subtitle>
                    </>
                );
            case 'success':
                return (
                    <>
                        <Title>Email Verified!</Title>
                        <Subtitle>Your email has been successfully verified. You can now log in to your account.</Subtitle>
                        <StatusMessage type="success">{message}</StatusMessage>
                        <ButtonGroup>
                            <Button variant="primary" onClick={() => navigate('/login')}>
                                Continue to Login
                            </Button>
                        </ButtonGroup>
                    </>
                );
            case 'error':
                return (
                    <>
                        <Title>Verification Failed</Title>
                        <Subtitle>We couldn't verify your email address. The link may be expired or invalid.</Subtitle>
                        <StatusMessage type="error">{message}</StatusMessage>
                        {email && (
                            <ButtonGroup>
                                <Button
                                    variant="primary"
                                    onClick={resendVerificationEmail}
                                    disabled={!canResend || isResending}
                                >
                                    {isResending ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <LoadingSpinner />
                                            </motion.div>
                                            Resending...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} />
                                            {canResend ? 'Resend Verification Email' : `Resend in ${countdown}s`}
                                        </>
                                    )}
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/login')}>
                                    <ArrowLeft size={16} />
                                    Back to Login
                                </Button>
                            </ButtonGroup>
                        )}
                    </>
                );
            default:
                return (
                    <>
                        <Title>Check Your Email</Title>
                        <Subtitle>
                            We've sent a verification link to your email address. Please click the link to verify your account.
                        </Subtitle>
                        {email && <EmailText>{email}</EmailText>}
                        {message && <StatusMessage type="info">{message}</StatusMessage>}
                        <ButtonGroup>
                            {email && (
                                <Button
                                    variant="primary"
                                    onClick={resendVerificationEmail}
                                    disabled={!canResend || isResending}
                                >
                                    {isResending ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <LoadingSpinner />
                                            </motion.div>
                                            Resending...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} />
                                            {canResend ? 'Resend Verification Email' : `Resend in ${countdown}s`}
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => navigate('/login')}>
                                <ArrowLeft size={16} />
                                Back to Login
                            </Button>
                        </ButtonGroup>
                    </>
                );
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Card>
                        <IconWrapper status={status}>
                            {renderIcon()}
                        </IconWrapper>
                        {renderContent()}
                    </Card>
                </motion.div>
            </Container>
        </ThemeProvider>
    );
};

export default EmailVerification;