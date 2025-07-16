import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  Sparkles
} from 'lucide-react';

interface ChatAssistantProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  insights?: {
    type: 'chart' | 'recommendation' | 'insight';
    title: string;
    content: string;
  }[];
}

export function ChatAssistant({ onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your NeuraOps AI assistant. How can I help you with your manufacturing operations today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setThinking(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      let aiResponse: Message;

      // Generate different responses based on user input
      if (input.toLowerCase().includes('oee') || input.toLowerCase().includes('efficiency')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'The recent drop in OEE is primarily due to increased downtime on Assembly Line A. Our analysis shows that the main causes are unplanned maintenance issues (42%), material shortages (28%), and operator availability (18%).',
          timestamp: new Date(),
          insights: [
            {
              type: 'chart',
              title: 'OEE Trend Analysis',
              content: 'The chart shows a 4.2% decline in OEE over the past week, with availability being the most affected component.'
            },
            {
              type: 'recommendation',
              title: 'Recommended Actions',
              content: 'Implement preventive maintenance on Assembly Line A and review material ordering processes to prevent shortages.'
            }
          ]
        };
      } else if (input.toLowerCase().includes('inventory') || input.toLowerCase().includes('materials')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Your current inventory levels for raw materials are at 92% of optimal levels. However, I\'ve detected that 3 critical materials (Aluminum Sheet 3mm, Plastic Resin Type B, and Circuit Board v2) are below their reorder points and require immediate attention.',
          timestamp: new Date(),
          insights: [
            {
              type: 'insight',
              title: 'Critical Materials',
              content: 'Aluminum Sheet 3mm (15 units), Plastic Resin Type B (18 units), and Circuit Board v2 (32 units) are below threshold levels.'
            },
            {
              type: 'recommendation',
              title: 'Order Recommendation',
              content: 'Place orders for these materials within the next 48 hours to avoid production disruptions.'
            }
          ]
        };
      } else if (input.toLowerCase().includes('cost') || input.toLowerCase().includes('profit')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Your current cost per unit is $12.47, which is 24.7% above your target of $10.00. The main cost drivers are raw materials (38.7%), labor (29.3%), and overhead (16.8%). I\'ve identified several optimization opportunities that could reduce costs by up to $0.85 per unit.',
          timestamp: new Date(),
          insights: [
            {
              type: 'chart',
              title: 'Cost Breakdown Analysis',
              content: 'Raw materials and labor costs have increased by 5.2% and 3.8% respectively compared to last quarter.'
            },
            {
              type: 'recommendation',
              title: 'Cost Reduction Opportunities',
              content: 'Material substitution ($0.42/unit), process optimization ($0.28/unit), and supplier negotiation ($0.15/unit) could reduce total costs by 6.8%.'
            }
          ]
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Based on your current manufacturing data, I\'ve identified several areas for improvement. Your production efficiency is at 78.3% (target: 85%), inventory levels are at 92% with 3 materials below reorder points, and your cost per unit is $12.47 (target: $10.00). Would you like me to provide more specific insights on any of these areas?',
          timestamp: new Date(),
        };
      }

      setThinking(false);
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                          className={`rounded-lg px-4 py-2 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  disabled={thinking}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || thinking}
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <div>Powered by NeuraOps AI</div>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Suggested questions
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}