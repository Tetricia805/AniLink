import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Search,
  User,
  Plus,
  Clock,
  Check,
  CheckCheck,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import * as conversationsApi from '@/api/conversations';
import * as vetsApi from '@/api/vet';
import { getMe } from '@/api/auth';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [newConversationParticipant, setNewConversationParticipant] = useState('');
  const [availableVets, setAvailableVets] = useState([]);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCurrentUser = async () => {
    try {
      const response = await getMe();
      if (response.status === 'success') {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load current user', error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsApi.getConversations();
      setConversations(response.data.conversations || []);
      if (response.data.conversations?.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.conversations[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await conversationsApi.getConversationMessages(conversationId);
      const messagesList = response.data.messages || [];
      setMessages(messagesList.reverse()); // Reverse to show oldest first
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load messages',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await conversationsApi.markMessagesRead(conversationId);
    } catch (error) {
      console.error('Failed to mark messages as read', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await conversationsApi.sendMessage(selectedConversation._id, {
        body: newMessage.trim()
      });
      setNewMessage('');
      loadMessages(selectedConversation._id);
      loadConversations(); // Refresh to update last message
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationParticipant) {
      toast({
        title: 'Error',
        description: 'Please select a participant',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await conversationsApi.createConversation({
        participants: [newConversationParticipant],
        channelType: 'farmer_vet'
      });
      setIsNewConversationOpen(false);
      setNewConversationParticipant('');
      loadConversations();
      if (response.data.conversation) {
        setSelectedConversation(response.data.conversation);
      }
      toast({
        title: 'Success',
        description: 'Conversation created'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create conversation',
        variant: 'destructive'
      });
    }
  };

  const loadAvailableVets = async () => {
    try {
      const response = await vetsApi.listVets({ limit: 50 });
      setAvailableVets(response.data.vets || []);
    } catch (error) {
      console.error('Failed to load vets', error);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!currentUser || !conversation.participants) return null;
    const currentUserId = currentUser._id || currentUser;
    const other = conversation.participants.find(
      p => {
        const participantId = typeof p === 'object' ? (p._id || p) : p;
        return participantId !== currentUserId;
      }
    );
    return other;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const formatMessageTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Messages</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Chat with veterinarians, vendors, and get support
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conversations</CardTitle>
                    <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => {
                            loadAvailableVets();
                            setIsNewConversationOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Start New Conversation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Veterinarian</Label>
                            <Select
                              value={newConversationParticipant}
                              onValueChange={setNewConversationParticipant}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a vet" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableVets.map(vet => (
                                  <SelectItem key={vet._id} value={vet.user?._id || vet.user}>
                                    {vet.user?.name || 'Veterinarian'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleCreateConversation} className="w-full">
                            Start Conversation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start a new conversation to get started</p>
                    </div>
                  ) : (
                    conversations.map(conversation => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const isSelected = selectedConversation?._id === conversation._id;
                      return (
                        <div
                          key={conversation._id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm truncate">
                                  {typeof otherParticipant === 'object' && otherParticipant?.name
                                    ? otherParticipant.name
                                    : 'Unknown User'}
                                </h4>
                                {conversation.lastMessageAt && (
                                  <span className="text-xs text-gray-500">
                                    {formatDate(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>
                          {(() => {
                            const other = getOtherParticipant(selectedConversation);
                            return typeof other === 'object' && other?.name
                              ? other.name
                              : 'Conversation';
                          })()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Messages List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation by sending a message</p>
                          </div>
                        ) : (
                          messages.map(message => {
                            const isOwnMessage = message.sender?._id === currentUser?._id ||
                                                (typeof message.sender === 'string' && message.sender === currentUser?._id);
                            const otherParticipant = getOtherParticipant(selectedConversation);
                            const otherParticipantId = typeof otherParticipant === 'object' 
                              ? (otherParticipant._id || otherParticipant)
                              : otherParticipant;
                            const isRead = message.readBy?.some(
                              id => {
                                const readById = typeof id === 'object' ? (id._id || id) : id;
                                return readById === otherParticipantId;
                              }
                            );
                            
                            return (
                              <div
                                key={message._id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isOwnMessage
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    <span>{formatMessageTime(message.createdAt)}</span>
                                    {isOwnMessage && (
                                      <span className="ml-1">
                                        {isRead ? (
                                          <CheckCheck className="h-3 w-3 inline" />
                                        ) : (
                                          <Check className="h-3 w-3 inline" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <form onSubmit={handleSendMessage} className="border-t p-4">
                        <div className="flex items-end space-x-2">
                          <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows={2}
                            className="resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            size="lg"
                          >
                            {sending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                      <p className="text-gray-600">
                        Choose a conversation from the list or start a new one
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Messages;

