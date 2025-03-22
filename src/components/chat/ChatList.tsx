import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { ChatThread, ChatListProps } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      setError("Please sign in to view your conversations");
      return;
    }

    // Query chat threads where the current user is a participant
    const q = query(
      collection(db, "chatThreads"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const threads: ChatThread[] = [];
        snapshot.forEach((doc) => {
          threads.push({ id: doc.id, ...doc.data() } as ChatThread);
        });
        setChatThreads(threads);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error processing chat threads:", error);
        setError("Failed to load conversations");
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching chat threads:", error);
      setError("Failed to load conversations");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getOtherParticipant = (chatThread: ChatThread) => {
    const currentUserId = auth.currentUser?.uid || "";
    const otherUserId = chatThread.participants.find(id => id !== currentUserId) || "";
    const otherUserInfo = chatThread.participantsInfo?.[otherUserId] || {};
    
    return {
      id: otherUserId,
      name: otherUserInfo.name || otherUserInfo.email || "Unknown User"
    };
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    
    try {
      const date = timestamp.toDate();
      const now = new Date();
      
      // If today, show time only
      if (date.toDateString() === now.toDateString()) {
        return format(date, "h:mm a");
      }
      
      // If this year, show month and day
      if (date.getFullYear() === now.getFullYear()) {
        return format(date, "MMM d");
      }
      
      // Otherwise show date
      return format(date, "MM/dd/yy");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <p className="text-sm text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>{error}</p>
        {error === "Please sign in to view your conversations" && (
          <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/login"}>
            Sign In
          </Button>
        )}
      </div>
    );
  }

  if (chatThreads.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new chat using the button above</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chatThreads.map((thread) => {
        const otherUser = getOtherParticipant(thread);
        const isSelected = selectedChatId === thread.id;

        return (
          <Card
            key={thread.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
              isSelected ? "bg-blue-50 border-blue-200" : ""
            }`}
            onClick={() => onSelectChat(thread.id || "", otherUser)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                    {otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{otherUser.name}</h3>
                  {thread.lastMessage && (
                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                      {thread.lastMessage.senderId === auth.currentUser?.uid 
                        ? `You: ${thread.lastMessage.text}` 
                        : thread.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
              {thread.lastMessage?.timestamp && (
                <span className="text-xs text-gray-400">
                  {formatTime(thread.lastMessage.timestamp)}
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ChatList; 