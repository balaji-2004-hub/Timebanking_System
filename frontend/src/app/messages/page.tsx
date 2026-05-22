'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { MessageSquare, Send, Search, RefreshCw, Inbox, CheckCheck } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { apiListMembers, apiListMessages, apiMarkMessageRead, apiSendMessage } from '@/lib/timebank-api';
import { useSearchParams } from 'next/navigation';

interface MemberSummary {
  email: string;
  displayName: string;
  role: string;
  ageGroup: 'senior' | 'adult' | 'youth';
  credits: number;
  exchanges: number;
  skillsOffered: string[];
  neighborhood: string;
}

interface MessageItem {
  id: number;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  threadId: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { profile } = useCurrentUserProfile();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [memberData, messageData] = await Promise.all([apiListMembers(), apiListMessages(user.email)]);
      setMembers(memberData.members);
      setMessages(messageData.items);
      const prefillRecipient = searchParams.get('to');
      const prefillSubject = searchParams.get('subject');
      if (prefillRecipient && !recipientEmail) setRecipientEmail(prefillRecipient);
      if (prefillSubject && !subject) setSubject(prefillSubject);
      if (messageData.items.length > 0 && selectedId === null) {
        setSelectedId(messageData.items[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const filteredMessages = useMemo(() => {
    const text = query.trim().toLowerCase();
    return messages.filter((message) => !text || [message.subject, message.body, message.senderEmail, message.recipientEmail].join(' ').toLowerCase().includes(text));
  }, [messages, query]);

  const selectedMessage = filteredMessages.find((message) => message.id === selectedId) ?? filteredMessages[0] ?? null;

  const handleSend = async () => {
    if (!user) return;
    setError('');
    setStatus('');
    try {
      if (!recipientEmail.trim() || !subject.trim() || !body.trim()) {
        throw new Error('Recipient, subject, and message body are required.');
      }
      await apiSendMessage({ senderEmail: user.email, recipientEmail: recipientEmail.trim(), subject: subject.trim(), body: body.trim() });
      setBody('');
      setStatus('Message sent successfully.');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    }
  };

  const markRead = async (message: MessageItem) => {
    if (message.read) return;
    await apiMarkMessageRead(message.id);
    await fetchData();
  };

  return (
    <AppLayout variant={user?.role === 'admin' ? 'admin' : 'member'}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A simple inbox and compose flow backed by the server database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-4 border border-border">
              <Search size={16} className="text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none text-sm w-full" placeholder="Search inbox..." />
            </div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Inbox size={16} /> Inbox</h3>
              <button onClick={fetchData} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted transition-colors">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-6 text-center">
                <MessageSquare size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="font-medium text-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start by sending a message to a member.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                {filteredMessages.map((message) => (
                  <button key={message.id} onClick={() => { setSelectedId(message.id); markRead(message); }} className={`w-full text-left rounded-xl border p-3 transition-colors ${selectedMessage?.id === message.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 border-border hover:bg-muted'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{message.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{message.senderEmail} → {message.recipientEmail}</p>
                      </div>
                      {!message.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 max-h-12 overflow-hidden">{message.body}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Compose</p>
            <select value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none mb-3">
              <option value="">Choose recipient</option>
              {members.filter((member) => member.email !== user?.email).map((member) => (
                <option key={member.email} value={member.email}>{member.displayName} · {member.email}</option>
              ))}
            </select>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none mb-3" placeholder="Subject" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-input text-sm outline-none resize-none mb-3" placeholder="Write your message" />
            <button onClick={handleSend} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-amber-700 transition-colors">
              <Send size={14} /> Send message
            </button>
            {status && <p className="text-sm font-medium text-success mt-3">{status}</p>}
            {error && <p className="text-sm font-medium text-danger mt-3">{error}</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 min-h-[520px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold text-foreground">Conversation</h2>
              <span className="text-xs text-muted-foreground">{profile?.displayName || user?.displayName || 'New user'}</span>
            </div>

            {selectedMessage ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{selectedMessage.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                    {!selectedMessage.read && <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><CheckCheck size={12} /> Unread</span>}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedMessage.body}</p>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/20">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Participants</p>
                  <p className="text-sm text-foreground">From: {selectedMessage.senderEmail}</p>
                  <p className="text-sm text-foreground">To: {selectedMessage.recipientEmail}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Send size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="font-medium text-foreground">Nothing selected</p>
                <p className="text-sm text-muted-foreground mt-1">Choose a thread or send a new message from the left panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
