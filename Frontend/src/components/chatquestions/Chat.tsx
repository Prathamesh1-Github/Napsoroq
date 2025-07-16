import { useState } from 'react';
import { ChatAssistant } from './ChatAssistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Brain } from 'lucide-react';

function Chat() {
    const [showChat, setShowChat] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Brain className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">AI Assistant</CardTitle>
                            </div>
                            <CardDescription className="text-muted-foreground">
                                Ask questions about your manufacturing data and get intelligent insights.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "What's causing the drop in OEE today?",
                                    "Which products have the highest profit margin?",
                                    "When should we order more raw materials?",
                                    "How can we reduce production costs?"
                                ].map((question, i) => (
                                    <button
                                        key={i}
                                        className="text-sm text-foreground rounded-lg border border-border bg-card p-4 hover:bg-muted transition-colors text-left w-full"
                                        onClick={() => setShowChat(true)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>

                            <Button onClick={() => setShowChat(true)} className="w-full" size="lg">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Start Chat with AI Assistant
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showChat && (
                <ChatAssistant onClose={() => setShowChat(false)} />
            )}
        </div>
    );
}

export default Chat;