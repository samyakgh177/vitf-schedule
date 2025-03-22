import React, { useState, useEffect } from "react";
import { auth } from "@/firebase";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import UserSearch from "@/components/chat/UserSearch";
import ChatList from "@/components/chat/ChatList";
import ChatThread from "@/components/chat/ChatThread";
import { Button } from "@/components/ui/button";
import { PlusIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PrivateChat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string } | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast("Not logged in", {
          description: "You must be logged in to use the chat",
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Handle chat selection
  const handleSelectChat = (chatId: string, user: { id: string; name: string }) => {
    setSelectedChat(chatId);
    setOtherUser(user);
    
    // On mobile, hide the chat list and show the chat thread
    if (!isDesktop) {
      setShowChatList(false);
    }
  };
  
  // Handle starting a new chat
  const handleChatStart = (chatId: string, otherUserId: string, otherUserName: string) => {
    setSelectedChat(chatId);
    setOtherUser({ id: otherUserId, name: otherUserName });
    setShowSearch(false);
    
    // On mobile, hide the chat list and show the chat thread
    if (!isDesktop) {
      setShowChatList(false);
    }
  };
  
  // Handle back button on mobile
  const handleBackToList = () => {
    if (!isDesktop) {
      setShowChatList(true);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden flex">
        {/* Chat List Column */}
        {(isDesktop || showChatList) && (
          <div className={`${isDesktop ? 'w-1/3 border-r' : 'w-full'} flex flex-col h-full`}>
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-medium text-lg text-gray-800">Messages</h2>
              <Button 
                onClick={() => setShowSearch(!showSearch)} 
                variant="ghost" 
                size="icon"
                className="text-blue-600"
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
            
            {showSearch ? (
              // User Search Component
              <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-3 flex items-center">
                  <Button
                    onClick={() => setShowSearch(false)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-gray-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to messages
                  </Button>
                </div>
                <UserSearch onChatStart={handleChatStart} />
              </div>
            ) : (
              // Chat List Component
              <div className="flex-1 overflow-y-auto">
                <ChatList 
                  onSelectChat={handleSelectChat} 
                  selectedChatId={selectedChat || undefined}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Chat Thread Column */}
        {(isDesktop || !showChatList) && (
          <div className={`${isDesktop ? 'w-2/3' : 'w-full'} h-full flex flex-col`}>
            {selectedChat && otherUser ? (
              <ChatThread 
                chatId={selectedChat} 
                otherUserId={otherUser.id} 
                otherUserName={otherUser.name}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Your Messages</h3>
                <p className="text-gray-600 max-w-xs mb-4">
                  Select a conversation from the list or start a new one to begin messaging
                </p>
                {!isDesktop && (
                  <Button
                    onClick={() => setShowSearch(true)}
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Start a New Chat
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateChat; 