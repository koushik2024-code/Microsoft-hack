import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface IncidentChatProps {
  incidentId: string;
  onSendMessage: (message: string, history: ChatMessage[]) => Promise<{ reply: string }>;
}

const IncidentChat = ({ incidentId, onSendMessage }: IncidentChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am IncidentMind. How can I help you investigate this incident?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset chat when incident changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am IncidentMind. How can I help you investigate this incident?',
        timestamp: new Date().toISOString()
      }
    ]);
  }, [incidentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage.content, messages);
      setMessages([...newMessages, {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '**Error:** Failed to communicate with the agent. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-3 border-b border-gray-800 bg-gray-900/80 flex items-center gap-2">
        <Bot className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-gray-200">Incident Assistant</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800 border border-gray-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-300" />}
            </div>
            
            <div className={`rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
              <div className={`text-[10px] mt-1.5 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
             <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 mt-1">
               <Bot className="w-4 h-4 text-indigo-300" />
             </div>
             <div className="bg-gray-800/80 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
               <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
               <span className="text-xs text-gray-400 ml-2">Agent is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask IncidentMind to analyze logs, suggest fixes..."
            className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentChat;
