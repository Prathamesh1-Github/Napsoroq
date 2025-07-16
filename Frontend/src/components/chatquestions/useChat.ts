import { useState, useEffect } from 'react';
import { apiClient, ApiMessage } from './api';

export interface UseChatReturn {
    messages: ApiMessage[];
    sendMessage: (message: string) => Promise<void>;
    loading: boolean;
    thinking: boolean;
    error: string | null;
}

export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ApiMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.getMessages();
            setMessages(response.messages);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setError(err instanceof Error ? err.message : 'Failed to load chat history');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (message: string) => {
        if (!message.trim() || thinking) return;

        try {
            setThinking(true);
            setError(null);

            // Add user message immediately
            const userMessage: ApiMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: message,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, userMessage]);

            const response = await apiClient.sendMessage(message);
            
            // Replace the temporary user message with the server response
            setMessages(prev => {
                const filtered = prev.filter(msg => msg.id !== userMessage.id);
                return [...filtered, ...response.messages];
            });
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
            
            // Remove the temporary user message on error
            setMessages(prev => prev.filter(msg => msg.id !== Date.now().toString()));
        } finally {
            setThinking(false);
        }
    };

    return {
        messages,
        sendMessage,
        loading,
        thinking,
        error,
    };
}