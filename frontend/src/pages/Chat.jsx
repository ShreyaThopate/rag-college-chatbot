import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { SourceCard } from '../components/Sources/SourceCard';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  AlertCircle,
  BookOpen,
  HelpCircle,
  ArrowDown,
  Info,
  Layers,
} from 'lucide-react';

export const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingConversations, setFetchingConversations] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    {
      label: '🎓 DTE Admissions & CAP',
      query: 'What are the B.E. admission eligibility requirements and DTE Choice Code for Sinhgad Academy of Engineering?',
    },
    {
      label: '💰 FRA Fee Structure & EBC',
      query: 'What is the fee structure for Open and EBC categories at SAOE, and what are the payment modes?',
    },
    {
      label: '💼 CPC Campus Placements',
      query: 'Which companies visit Sinhgad Central Placement Cell (CPC) and what is the highest package?',
    },
    {
      label: '🏢 Specialized Labs & HODs',
      query: 'What are the specialized laboratories and faculty in the Computer Engineering department?',
    },
    {
      label: '🏠 Kondhwa Hostels & Mess',
      query: 'What are the hostel room facilities and mess timings at Sinhgad Kondhwa campus?',
    },
    {
      label: '📝 SPPU Exams & 75% Rule',
      query: 'When is the examination form submission deadline and what is the minimum attendance required?',
    },
    {
      label: '❓ Unknown Question Demo',
      query: 'What is the college policy on deep-sea submarine archaeology research?',
    },
  ];

  // Fetch all user conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when current conversation changes
  useEffect(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      setFetchingConversations(true);
      const res = await api.get('/conversations', { params: { collegeId: 'saoe_pune' } });
      setConversations(res.data.conversations || []);
      if (res.data.conversations?.length > 0 && !currentConversationId) {
        setCurrentConversationId(res.data.conversations[0]._id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setFetchingConversations(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/conversations/${convId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.delete(`/conversations/${convId}`);
      const updated = conversations.filter((c) => c._id !== convId);
      setConversations(updated);
      if (currentConversationId === convId) {
        if (updated.length > 0) {
          setCurrentConversationId(updated[0]._id);
        } else {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputMessage).trim();
    if (!textToSend || loading) return;

    setInputMessage('');
    setLoading(true);

    // Optimistically add user message to UI
    const tempUserMsg = {
      _id: 'temp_user_' + Date.now(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post('/chat', {
        conversationId: currentConversationId,
        collegeId: 'saoe_pune',
        message: textToSend,
      });

      const { answer, sources, found, conversationId, messageId } = res.data;

      // Update current conversation ID if this was a new conversation
      if (!currentConversationId && conversationId) {
        setCurrentConversationId(conversationId);
        fetchConversations();
      }

      const assistantMsg = {
        _id: messageId || 'temp_bot_' + Date.now(),
        role: 'assistant',
        content: answer,
        sources: sources || [],
        found: found !== undefined ? found : true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        _id: 'temp_err_' + Date.now(),
        role: 'assistant',
        content: 'An error occurred while retrieving answers from the knowledge base. Please verify the backend is running.',
        sources: [],
        found: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-950">
      {/* Sidebar - Conversations */}
      <aside
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900/60 flex flex-col flex-shrink-0 relative overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Previous Conversations
          </div>

          {fetchingConversations ? (
            <div className="p-4 text-center text-xs text-slate-500">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <p>No previous conversations.</p>
              <p className="mt-1 text-slate-600">Start asking questions!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv._id === currentConversationId;
              return (
                <div
                  key={conv._id}
                  onClick={() => setCurrentConversationId(conv._id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-600/20 border border-brand-500/40 text-white font-medium shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate pr-2">
                    <MessageSquare
                      className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`}
                    />
                    <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>RAG Engine Online</span>
          </div>
          <span>v1.0</span>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-10">
              {/* Welcome Banner */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/20">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Sinhgad Academy of Engineering, Pune (DTE: 6187)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome, {user?.name?.split(' ')[0] || 'Student'}!
                </h2>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  Ask me anything about SAOE admissions, SPPU syllabus, FRA fees, scholarships, CPC placements, Kondhwa hostels, and campus rules.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div>
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Suggested Sample Questions</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.query)}
                      className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/40 text-left transition-all duration-200 group flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-brand-300 group-hover:text-brand-200 mb-1">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-400 group-hover:text-slate-300 leading-snug">
                        "{item.query}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex items-start space-x-3 sm:space-x-4 ${
                      isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                          : 'bg-slate-800 border border-slate-700 text-brand-400'
                      }`}
                    >
                      {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble Container */}
                    <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'glass-panel text-slate-200 rounded-tl-none border border-slate-800'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose-chat text-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* Not Found Warning Alert */}
                      {!isUser && msg.found === false && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            <strong>Notice:</strong> This query could not be verified in the college knowledge base. No sources cited.
                          </span>
                        </div>
                      )}

                      {/* Sources Section */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="pt-1">
                          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            <BookOpen className="w-3 h-3 text-brand-400" />
                            <span>Supporting College Sources ({msg.sources.length})</span>
                          </div>

                          <div className="space-y-2">
                            {msg.sources.map((source, sIdx) => (
                              <SourceCard key={sIdx} source={source} index={sIdx} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse delay-200"></div>
                    </div>
                    <span>Retrieving verified campus documents & synthesizing response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl shadow-lg focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
              <textarea
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CollegeGPT anything (e.g. fees, admission, exams, hostels)..."
                className="w-full pl-4 pr-12 py-3.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="absolute right-2.5 p-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-500/20"
                title="Send Question"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-2">
              Responses are grounded in verified college documentation. Always verify formal decisions with department heads.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
