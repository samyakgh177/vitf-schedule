import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Search, Loader2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { UserSearchProps } from "@/types/chat";

const UserSearch: React.FC<UserSearchProps> = ({ onChatStart }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    email: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    // Clear results when search term is empty
    if (!searchTerm.trim()) {
      setSearchResults([]);
    }
  }, [searchTerm]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }
    
    if (!auth.currentUser) {
      toast("Not logged in", {
        description: "You must be logged in to search for users.",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Search by name (case insensitive)
      const nameQuery = query(
        collection(db, "users"),
        where("name", ">=", searchTerm.toLowerCase()),
        where("name", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );
      
      // Search by email
      const emailQuery = query(
        collection(db, "users"),
        where("email", ">=", searchTerm.toLowerCase()),
        where("email", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );
      
      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery)
      ]);
      
      const results = new Map();
      
      // Add results from name query
      nameSnapshot.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid) {
          results.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      });
      
      // Add results from email query
      emailSnapshot.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid) {
          results.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      });
      
      const formattedResults = Array.from(results.values()).map(user => ({
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "No email"
      }));
      
      setSearchResults(formattedResults);
      
      if (formattedResults.length === 0) {
        setError("No users found. Try a different search term.");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Failed to search users. Please try again.");
      toast("Search failed", {
        description: "There was a problem searching for users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const startChat = async (userId: string, userName: string) => {
    if (!auth.currentUser) {
      toast("Not logged in", {
        description: "You must be logged in to start a chat.",
      });
      return;
    }
    
    setStartingChat(userId);
    
    try {
      const currentUserId = auth.currentUser.uid;
      
      // Check if chat already exists between these users
      const chatQuery1 = query(
        collection(db, "chatThreads"),
        where("participants", "==", [currentUserId, userId])
      );
      
      const chatQuery2 = query(
        collection(db, "chatThreads"),
        where("participants", "==", [userId, currentUserId])
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(chatQuery1),
        getDocs(chatQuery2)
      ]);
      
      let chatId;
      
      // Use existing chat if found
      if (!snapshot1.empty) {
        chatId = snapshot1.docs[0].id;
      } else if (!snapshot2.empty) {
        chatId = snapshot2.docs[0].id;
      } else {
        // Get current user's info
        const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
        const currentUserData = currentUserDoc.data();
        
        // Create new chat thread
        const chatRef = await addDoc(collection(db, "chatThreads"), {
          participants: [currentUserId, userId],
          participantsInfo: {
            [currentUserId]: {
              name: currentUserData?.name || "You",
              email: currentUserData?.email || ""
            },
            [userId]: {
              name: userName,
              email: ""
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null
        });
        
        chatId = chatRef.id;
      }
      
      // Pass the chat info back to parent component
      onChatStart(chatId, userId, userName);
      
      // Clear search
      setSearchTerm("");
      setSearchResults([]);
      
    } catch (error) {
      console.error("Error starting chat:", error);
      toast("Failed to start chat", {
        description: "There was a problem creating the conversation. Please try again.",
      });
    } finally {
      setStartingChat(null);
    }
  };
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mb-4 border-blue-200 bg-blue-50 hover:bg-blue-100 font-medium">
          <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl mb-2">Start a New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleSearch} disabled={!searchTerm.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p>Searching for users...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="max-w-sm">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-gray-600">{error}</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Try a different search term or check the spelling.
                    </p>
                  )}
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      onClick={() => startChat(user.id, user.name)}
                      disabled={startingChat === user.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {startingChat === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Chat
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different search term or check the spelling
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-gray-600">Search for users to start a conversation</p>
                <p className="text-sm text-gray-500 mt-1">
                  Enter a name or email address to find people
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearch; 