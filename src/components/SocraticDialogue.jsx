import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, User, Clock, RefreshCw, CheckCircle } from 'lucide-react';

const SocraticDialogue = ({ topic = "Situation Ethics", duration = 10 }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // minutes to seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [midPromptShown, setMidPromptShown] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false);
            setSessionComplete(true);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Call GPT backend
  const getSocraticResponse = async (topic, chatHistory) => {
    const response = await fetch('/api/gpt-socratic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, chatHistory })
    });
    const data = await response.json();
    return data.reply;
  };

  const startSession = async () => {
    setIsActive(true);
    setSessionComplete(false);
    setMessages([]);
    setTimeLeft(duration * 60);
    setIsLoading(true);
    // Add intro message about the 10-minute session
    const introMessage = {
      id: 1,
      sender: 'ai',
      text: `Hi, we've got 10 minutes to talk about ${topic}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([introMessage]);
    // Wait 1 second, then get opening question from GPT
    setTimeout(async () => {
      const opening = await getSocraticResponse(topic, []);
      setMessages(prev => [
        ...prev,
        {
          id: 2,
          sender: 'ai',
          text: opening,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading || !isActive) return;
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: currentInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);
    // Get GPT response
    const chatHistory = [...messages, userMessage].map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }));
    const aiReply = await getSocraticResponse(topic, chatHistory);
    // Add a 1 second delay before showing the AI's response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setTimeLeft(duration * 60);
    setIsActive(false);
    setSessionComplete(false);
    setCurrentInput('');
  };

  // Add effect to handle timer end and send final AI message
  useEffect(() => {
    if (isActive && timeLeft === 0 && !sessionComplete) {
      // Add a final AI message before session complete
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'ai',
            text: "That's enough for today, let's talk again soon!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        // Show session complete after a short delay
        setTimeout(() => {
          setSessionComplete(true);
        }, 1500);
      }, 1000);
    }
    // Mid-session prompt at 5 minutes
    if (isActive && timeLeft === 5 * 60 && !midPromptShown) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'ai',
            text: `We're half way through our session - do you want to keep talking about this topic or chat about something else in the world of ${topic}?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        setMidPromptShown(true);
      }, 1000);
    }
  }, [isActive, timeLeft, sessionComplete, midPromptShown, topic]);

  if (sessionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Session Complete!</h3>
          <p className="text-gray-600 mb-6">
            Great job exploring {topic}! You've completed your Socratic dialogue session.
          </p>
          <button
            onClick={resetSession}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={20} />
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full h-[90vh] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" />
              <div>
                <h2 className="font-semibold">Socratic Dialogue</h2>
                <p className="text-sm opacity-90">{topic}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className={`font-mono ${timeLeft < 60 ? 'text-yellow-200' : ''}`}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 && !isActive ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Brain className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Think Deeply?</h3>
              <p className="text-gray-500 mb-4">
                I'll guide you through exploring {topic} with thoughtful questions.
              </p>
              <button
                onClick={startSession}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Start Dialogue
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-xs ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.sender === 'user' ? <User size={16} /> : <Brain size={16} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-tr-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center">
                      <Brain size={16} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        {/* Input Area */}
        {isActive && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-20"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocraticDialogue; 