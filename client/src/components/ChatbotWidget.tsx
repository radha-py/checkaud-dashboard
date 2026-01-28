import { useState, useRef, useEffect } from "react";
import { useChatbot } from "@/hooks/use-systems";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: "Hello! I'm your CheckAud Assistant. How can I help you today?", sender: 'bot' }
  ]);
  
  const chatMutation = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: query, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");

    try {
      const response = await chatMutation.mutateAsync(userMsg.text);
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: response.answer, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: "Sorry, I encountered an error. Please try again.", 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-slate-700 bg-slate-900 overflow-hidden">
              <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <Bot size={18} />
                  </div>
                  <span className="font-semibold">CheckAud Assistant</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  data-testid="button-close-chat"
                  className="h-8 w-8 hover:bg-white/20 text-white" 
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm",
                      msg.sender === 'user' ? "bg-blue-600" : "bg-slate-700"
                    )}>
                      {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm",
                      msg.sender === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-white">
                      <Bot size={14} />
                    </div>
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900">
                <form 
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    data-testid="input-chat"
                    placeholder="Ask about compliance..."
                    className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={chatMutation.isPending}
                  />
                  <Button 
                    type="submit"
                    data-testid="button-send-chat"
                    size="icon" 
                    disabled={!query.trim() || chatMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-chat"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50",
          isOpen 
            ? "bg-slate-700 text-slate-300" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
