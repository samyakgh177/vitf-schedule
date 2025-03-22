import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [formValue, setFormValue] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check auth and load messages
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    // Query messages
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        } as Message);
      });
      setMessages(messages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValue.trim()) return;
    
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: formValue,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || "Anonymous User",
        photoURL: user.photoURL || null,
      });

      setFormValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">VITF Chat</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Dashboard
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          <Card className="flex-1 overflow-y-auto p-4 mb-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Card>

          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!formValue.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { text, uid, displayName, createdAt } = message;
  const messageClass = uid === auth.currentUser?.uid ? "self-end bg-blue-100" : "self-start bg-white";
  
  const formattedTime = createdAt && typeof createdAt.toDate === 'function' 
    ? createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex flex-col max-w-[80%] ${uid === auth.currentUser?.uid ? 'self-end' : 'self-start'}`}>
      <div className="text-sm text-gray-600 mb-1">
        {uid !== auth.currentUser?.uid && displayName}
      </div>
      <div className={`rounded-lg p-3 ${messageClass}`}>
        <p>{text}</p>
        {formattedTime && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {formattedTime}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 