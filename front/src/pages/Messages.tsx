import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, UserPlus, Search } from 'lucide-react';
import { api } from '../api';
import ImgWithFallback from '../components/ImgWithFallback';

interface ChatPreview {
  peerId: number;
  peerName: string;
  peerAvatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  createTime: string;
  senderName: string;
  senderAvatar: string;
}

export default function Messages() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      const data = res.data || res.rows || [];
      const list = (Array.isArray(data) ? data : []).map((m: any) => ({
        peerId: m.senderId,
        peerName: m.senderName || '用户',
        peerAvatar: m.senderAvatar || '',
        lastMessage: m.content || '',
        time: formatMsgTime(m.createTime),
        unread: m.isRead === '0',
      }));
      setChats(list);
    } catch (_) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (peerId: number) => {
    try {
      const res = await api.getMessages(peerId);
      const data = res.data || res.rows || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (_) {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.peerId);
      const interval = setInterval(() => fetchMessages(selectedChat.peerId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, fetchMessages]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.searchUsers(searchQuery.trim());
      const data = res.data || res.rows || [];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (_) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = (user: any) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedChat({
      peerId: user.userId,
      peerName: user.nickName || '用户',
      peerAvatar: user.avatar || '',
      lastMessage: '',
      time: '',
      unread: false,
    });
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      await api.sendMessage(selectedChat.peerId, inputText.trim());
      setInputText('');
      fetchMessages(selectedChat.peerId);
      fetchConversations();
    } catch (_) {
      // silently fail
    }
  };

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.user_id;
      }
    } catch (_) {}
    return null;
  })();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)] flex flex-col">
      {selectedChat ? (
        <div className="flex flex-col h-full bg-surface">
          <header className="px-4 py-3 flex justify-between items-center bg-white border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="w-5 h-5 text-on-surface" />
              </button>
              <ImgWithFallback
                src={selectedChat.peerAvatar}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <h2 className="font-bold text-sm">{selectedChat.peerName}</h2>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-primary-container/10 rounded-br-none border border-primary/10'
                      : 'bg-white rounded-bl-none border border-outline-variant/20'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block text-right font-bold ${
                    msg.senderId === currentUserId ? 'text-primary' : 'text-outline'
                  }`}>
                    {formatMsgTime(msg.createTime)}
                  </span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-secondary text-sm py-8">暂无消息，发送第一条消息吧</p>
            )}
          </div>

          <footer className="p-4 bg-white border-t border-outline-variant/20">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="输入消息..."
                  className="w-full py-2 px-4 pr-10 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-sm shadow-inner"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-lg text-white">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </footer>
        </div>
      ) : (
        <div className="px-4">
          <div className="flex items-center justify-between mb-6 mt-4 px-2">
            <h2 className="text-2xl font-black">消息中心</h2>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 bg-primary text-white rounded-full hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Search modal */}
          {showSearch && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入用户名搜索..."
                  className="flex-1 py-2 px-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
                  autoFocus
                />
                <button onClick={handleSearch} disabled={searching} className="p-2 bg-primary text-white rounded-xl">
                  <Search className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} className="text-sm text-outline px-2">
                  取消
                </button>
              </div>
              {searching && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-surface-container-high border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {!searching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {searchResults.map((user: any) => (
                    <div
                      key={user.userId}
                      onClick={() => handleStartChat(user)}
                      className="flex items-center gap-3 p-3 hover:bg-surface-container rounded-xl cursor-pointer"
                    >
                      <ImgWithFallback
                        src={user.avatar || ''}
                        className="w-10 h-10 rounded-full object-cover"
                        alt={user.nickName}
                      />
                      <div>
                        <p className="font-bold text-sm">{user.nickName}</p>
                        <p className="text-[10px] text-outline">点击开始聊天</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-center text-sm text-secondary py-4">未找到用户</p>
              )}
            </motion.div>
          )}

          {chats.length === 0 ? (
            <div className="text-center py-20 text-secondary">
              <p className="text-lg font-bold mb-2">暂无消息</p>
              <p className="text-sm">当其他用户联系你时，消息会显示在这里</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.peerId}
                  onClick={() => setSelectedChat(chat)}
                  className="flex items-center gap-4 p-4 hover:bg-surface-container rounded-2xl transition-colors cursor-pointer"
                >
                  <ImgWithFallback
                    src={chat.peerAvatar}
                    className="w-14 h-14 rounded-full object-cover"
                    alt={chat.peerName}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-on-surface">{chat.peerName}</h3>
                      <span className="text-[10px] text-outline">{chat.time}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread ? 'text-primary font-bold' : 'text-secondary'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function formatMsgTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr.replace(/-/g, '/'));
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
