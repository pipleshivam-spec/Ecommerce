import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

const initialMessages: ContactMessage[] = [
  { id: 1, name: "John Smith", email: "john@example.com", phone: "+1 234 567 890", message: "I'm interested in your new collection. Can you provide more details about customization options?", date: "2026-02-28", read: false },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 345 678 901", message: "Do you offer international shipping? I'm based in London.", date: "2026-02-27", read: true },
  { id: 3, name: "Alex Chen", email: "alex@example.com", phone: "+1 456 789 012", message: "Great products! Would love to discuss a bulk order for corporate gifts.", date: "2026-02-25", read: true },
];

const AdminContacts = () => {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);

  const handleDelete = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
    toast.success("Message deleted");
  };

  const markRead = (id: number) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <AdminLayout title="Contact Messages">
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">
          {messages.length} messages · {messages.filter(m => !m.read).length} unread
        </p>

        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => markRead(msg.id)}
              className={`glass-card p-6 cursor-pointer transition-all hover:border-primary/30 ${!msg.read ? "border-l-2 border-l-primary" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{msg.name}</h3>
                      <p className="text-xs text-muted-foreground">{msg.email} · {msg.phone}</p>
                    </div>
                    {!msg.read && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">New</span>}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{msg.date}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No messages yet.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
