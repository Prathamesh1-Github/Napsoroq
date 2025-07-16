const API_BASE_URL = 'https://neura-ops.onrender.com/api/v1';

export interface ApiMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    insights?: {
        type: 'chart' | 'recommendation' | 'insight';
        title: string;
        content: string;
    }[];
}

export interface SendMessageResponse {
    messages: ApiMessage[];
}

export interface GetMessagesResponse {
    messages: ApiMessage[];
}

class ApiClient {
    private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Convert timestamp strings to Date objects
        if (data.messages) {
            data.messages = data.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp || msg.created_at)
            }));
        }

        if (data.message) {
            data.message.timestamp = new Date(data.message.timestamp || data.message.created_at);
        }

        return data;
    }

    async getMessages(): Promise<GetMessagesResponse> {
        return this.makeRequest<GetMessagesResponse>('/chat/messages');
    }

    async sendMessage(message: string): Promise<SendMessageResponse> {
        return this.makeRequest<SendMessageResponse>('/chat/messages', {
            method: 'POST',
            body: JSON.stringify({
                message,
            }),
        });
    }
}

export const apiClient = new ApiClient();