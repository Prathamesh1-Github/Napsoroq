import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from './useChat';
import { format } from 'date-fns';
import {
    Brain,
    ChevronDown,
    Loader2,
    Maximize2,
    Minimize2,
    SendHorizontal,
    X,
    BarChart3,
    Lightbulb,
    Sparkles,
    AlertCircle,
    Clock
} from 'lucide-react';

interface ChatAssistantProps {
    onClose: () => void;
}

export function ChatAssistant({ onClose }: ChatAssistantProps) {
    const [input, setInput] = useState('');
    const [minimized, setMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, loading, thinking, error } = useChat();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, thinking]);

    const handleSendMessage = async () => {
        if (!input.trim() || thinking) return;

        const messageToSend = input;
        setInput('');
        await sendMessage(messageToSend);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const suggestedQuestions = [
        "What's causing the drop in OEE today?",
        "Which products have the highest profit margin?",
        "When should we order more raw materials?",
        "How can we reduce production costs?"
    ];

    const handleSuggestedQuestion = async (question: string) => {
        setInput(question);
        await sendMessage(question);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    height: minimized ? '60px' : '600px',
                    width: minimized ? '300px' : '400px'
                }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed bottom-4 right-4 z-50 flex flex-col rounded-lg border bg-card shadow-lg"
            >
                <div className="flex items-center justify-between border-b p-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div className="font-medium">NeuraOps AI Assistant</div>
                        {!minimized && (
                            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                                AI Powered
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setMinimized(!minimized)}
                        >
                            {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {!minimized && (
                    <>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {loading && messages.length === 0 && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Initializing chat...</span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[80%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {message.role === 'assistant' && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        <Brain className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div>
                                                <div
                                                    className={`rounded-lg px-4 py-2 ${message.role === 'user'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                </div>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {format(message.timestamp, 'MMM dd, yyyy • HH:mm')}
                                                    </span>
                                                </div>

                                                {message.insights && message.insights.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {message.insights.map((insight, index) => (
                                                            <div key={index} className="rounded-lg border bg-card p-3">
                                                                <div className="flex items-center gap-2">
                                                                    {insight.type === 'chart' && <BarChart3 className="h-4 w-4 text-primary" />}
                                                                    {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-primary" />}
                                                                    {insight.type === 'insight' && <Sparkles className="h-4 w-4 text-primary" />}
                                                                    <div className="text-sm font-medium">{insight.title}</div>
                                                                </div>
                                                                <div className="mt-1 text-xs text-muted-foreground">
                                                                    {insight.content}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {thinking && (
                                    <div className="flex justify-start">
                                        <div className="flex max-w-[80%] gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    <Brain className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="rounded-lg bg-muted px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                        <p className="text-sm">Analyzing data...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        <div className="border-t p-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Ask about your manufacturing data..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={thinking || loading}
                                    className="flex-1"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || thinking || loading}
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <div>Powered by NeuraOps AI</div>
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 hover:bg-transparent"
                                        onClick={() => {
                                            const dropdown = document.getElementById('suggested-questions');
                                            if (dropdown) {
                                                dropdown.classList.toggle('hidden');
                                            }
                                        }}
                                    >
                                        <ChevronDown className="mr-1 h-3 w-3" />
                                        Suggested questions
                                    </Button>

                                    <div
                                        id="suggested-questions"
                                        className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border bg-popover p-2 shadow-lg hidden"
                                    >
                                        <div className="space-y-1">
                                            {suggestedQuestions.map((question, i) => (
                                                <button
                                                    key={i}
                                                    className="w-full cursor-pointer rounded-md bg-muted/50 px-3 py-2 text-left text-sm hover:bg-muted"
                                                    onClick={() => handleSuggestedQuestion(question)}
                                                >
                                                    {question}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}