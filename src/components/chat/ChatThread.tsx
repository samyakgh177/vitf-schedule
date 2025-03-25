import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, SendIcon, AlertCircle, ChevronLeft, MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { ChatThreadProps } from "@/types/chat";

const ChatThread: React.FC<ChatThreadProps> = ({ chatId, otherUserId, otherUserName, onBack }) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    senderId: string;
    timestamp: any;
    read: boolean;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  useEffect(() => {
    // No chat selected state
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Set up real-time listener for messages in this chat
      const messagesRef = collection(db, "chatThreads", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages: Array<{
          id: string;
          text: string;
          senderId: string;
          timestamp: any;
          read: boolean;
        }> = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: data.timestamp,
            read: data.read
          });
        });
        
        setMessages(loadedMessages);
        setLoading(false);
        
        // Mark messages as read if they are sent by the other user
        if (auth.currentUser) {
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.senderId === otherUserId && !data.read) {
              // Update the message to be marked as read
              updateDoc(doc.ref, { read: true }).catch(() => {
                // Silent catch - non-critical operation
              });
            }
          });
        }
      });
      
      return () => unsubscribe();
    } catch (error) {
      setError("Failed to set up message listener. Please try again.");
      setLoading(false);
    }
  }, [chatId, otherUserId]);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !auth.currentUser || !chatId) {
      if (!chatId) {
        toast("No conversation selected", {
          description: "Please select a conversation to send messages",
        });
      }
      return;
    }
    
    setSending(true);
    
    try {
      const messagesRef = collection(db, "chatThreads", chatId, "messages");
      
      // Add the message
      const messageData = {
        text: newMessage.trim(),
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        read: false
      };
      
      await addDoc(messagesRef, messageData);
      
      // Update the thread's updatedAt timestamp and lastMessage
      const threadRef = doc(db, "chatThreads", chatId);
      await updateDoc(threadRef, {
        updatedAt: serverTimestamp(),
        lastMessage: {
          text: newMessage.trim(),
          senderId: auth.currentUser.uid,
          timestamp: serverTimestamp()
        }
      });
      
      setNewMessage("");
    } catch (error) {
      toast("Error", {
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      const date = timestamp.toDate();
      
      // Today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Yesterday's date
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if message is from today or yesterday
      if (date >= today) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (date >= yesterday) {
        return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' }) + 
              ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error("Error formatting message time:", error);
      return 'Unknown time';
    }
  };

  // Show no chat selected state
  if (!chatId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-blue-100 rounded-full p-6 mb-4">
          <MessagesSquare className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Conversation Selected</h3>
        <p className="text-gray-600">Select a conversation from the list or start a new one</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center border-b p-3 bg-gray-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h3 className="font-medium text-gray-800">{otherUserName}</h3>
          <p className="text-sm text-gray-500">{loading ? "Loading..." : `${messages.length} message${messages.length !== 1 ? 's' : ''}`}</p>
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-gray-600">{error}</p>
            <Button className="mt-4" variant="outline" onClick={onBack}>
              Back to Conversations
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-100 rounded-full p-4 mb-3">
              <SendIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-1">No messages yet</p>
            <p className="text-sm text-gray-500">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === auth.currentUser?.uid;
              
              // Check if we should display a date separator
              let showDateSeparator = false;
              if (index === 0) {
                showDateSeparator = true;
              } else if (message.timestamp && messages[index-1].timestamp) {
                try {
                  const prevDate = messages[index-1].timestamp.toDate();
                  const currDate = message.timestamp.toDate();
                  
                  // Show date separator if the day is different
                  if (prevDate.getDate() !== currDate.getDate() || 
                      prevDate.getMonth() !== currDate.getMonth() || 
                      prevDate.getFullYear() !== currDate.getFullYear()) {
                    showDateSeparator = true;
                  }
                } catch (error) {
                  console.error("Error comparing dates:", error);
                }
              }
              
              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && message.timestamp && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs bg-gray-200 rounded-full px-3 py-1 text-gray-600">
                        {message.timestamp.toDate ? message.timestamp.toDate().toLocaleDateString([], {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Unknown date'}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg p-3 ${
                      isCurrentUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="break-words">{message.text}</p>
                      <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.timestamp ? formatMessageTime(message.timestamp) : 'Sending...'}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t p-3 bg-white flex items-center space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading || !!error || sending}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e);
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || loading || !!error || sending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default ChatThread; 