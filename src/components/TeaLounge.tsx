import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Coffee, Home, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TeaLoungeProps {
  onNavigate: (
    section: "home" | "chronicles" | "starlight" | "tealounge"
  ) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "gigi";
  timestamp: Date;
}

export const TeaLounge = ({ onNavigate }: TeaLoungeProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "OMG hi bestie! Welcome to our cozy little corner! ✨ I'm Gigi, your ultimate hype-woman and professional bestie. Spill the tea - what's going on in your world, honey? Tell me what wrong has Vahant done....",
      sender: "gigi",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [roastCounter, setRoastCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // API call to backend for AI-powered Gigi responses
  const handleSendMessage = async (
    userText: string,
    currentMessages: ChatMessage[]
  ): Promise<void> => {
    try {
      const payload = {
        conversationHistory: currentMessages, // Use the passed messages that include the new user message
        roastCounter: roastCounter,
      };

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/gigi-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Create Gigi's response message
      const gigiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.gigiResponse,
        sender: "gigi",
        timestamp: new Date(),
      };

      // Update messages and roast counter
      setMessages((prev) => [...prev, gigiMessage]);
      setRoastCounter(data.newRoastCounter);
    } catch (error) {
      console.error("Error calling Gigi API:", error);

      // Fallback response in case of error
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Bestie, I'm having a technical moment! My sass circuits need a quick reboot. Try again in a sec? 💕",
        sender: "gigi",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message immediately for snappy UI
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsTyping(true);

    // Call API with the updated messages that include the new user message
    await handleSendMessage(currentMessage, updatedMessages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20 flex justify-between items-center p-2 sm:p-3 md:p-4 lg:p-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate("home")}
          className="text-romantic hover:bg-secondary/50 border-0 text-xs sm:text-sm md:text-base min-h-[44px]"
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Garden</span>
        </Button>

        <div className="text-center flex-1 mx-1 sm:mx-2 md:mx-4">
          <h1 className="font-romantic text-sm sm:text-lg md:text-2xl lg:text-4xl text-romantic">
            Gigi&Kittu's Tea Lounge
          </h1>
          <p className="font-elegant text-romantic opacity-80 text-xs sm:text-sm hidden sm:block">
            with your bestie Gigi ✨
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-romantic">
          <Coffee className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 animate-gentle-float" />
          <span className="font-elegant text-xs sm:text-sm hidden sm:block">
            Cozy Corner
          </span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto pt-14 sm:pt-16 md:pt-20 lg:pt-24">
        <Card className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] lg:h-[600px] flex flex-col romantic-glow bg-card/60 backdrop-blur-sm border-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 space-y-2 sm:space-y-3 md:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] p-2 sm:p-3 md:p-4 rounded-2xl sm:rounded-3xl animate-bloom ${
                    message.sender === "user"
                      ? "bg-accent/80 text-romantic ml-auto romantic-glow"
                      : "bg-secondary/80 text-romantic romantic-glow"
                  }`}
                >
                  <p className="font-elegant leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base">
                    {message.text}
                  </p>
                  <div className="text-xs opacity-60 mt-1 sm:mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/80 text-romantic p-3 sm:p-4 rounded-2xl sm:rounded-3xl romantic-glow animate-bloom">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-romantic rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-romantic rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-romantic rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-t border-border/20">
            <div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Spill the tea, bestie... ✨"
                className="flex-1 bg-background/50 border-border/30 text-romantic placeholder:text-romantic/50 focus:ring-accent rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base min-h-[44px]"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="bg-accent/80 hover:bg-accent text-romantic border-0 hover-bloom px-3 sm:px-4 lg:px-6 rounded-xl sm:rounded-2xl min-h-[44px] min-w-[44px]"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            <p className="text-xs text-romantic/60 mt-1 sm:mt-2 text-center font-elegant">
              Gigi is your sassy bestie who's always on Team Kittu! 💕
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
