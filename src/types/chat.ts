export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any; // Firebase timestamp
  read: boolean;
}

export interface ChatThread {
  id?: string;
  participants: string[];
  participantsInfo: Record<string, {
    name: string;
    email?: string;
    photoURL?: string;
  }>;
  createdAt: any; // Firebase timestamp
  updatedAt: any; // Firebase timestamp
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any; // Firebase timestamp
  };
}

export interface ChatProps {
  userId: string;
}

export interface ChatListProps {
  onSelectChat: (chatId: string, otherUser: { id: string; name: string }) => void;
  selectedChatId?: string;
}

export interface ChatThreadProps {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
  onBack: () => void;
}

export interface UserSearchProps {
  onChatStart: (chatId: string, otherUserId: string, otherUserName: string) => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
} 