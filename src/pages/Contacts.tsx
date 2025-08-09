import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Profile { id: string; username: string | null; display_name: string | null; }
interface ContactRow { id: string; owner_id: string; contact_id: string; status: string; }

export default function Contacts() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Contacts - VibeFilter Studio"; }, []);

  useEffect(() => {
    if (!user) return;
    // Load my contacts
    supabase
      .from("contacts")
      .select("id, owner_id, contact_id, status")
      .or(`owner_id.eq.${user.id},contact_id.eq.${user.id}`)
      .then(({ data, error }) => {
        if (error) console.error(error);
        setContacts(data || []);
      });
  }, [user]);

  const myContactIds = useMemo(() => new Set(contacts.map(c => c.owner_id === user?.id ? c.contact_id : c.owner_id)), [contacts, user]);

  const search = async (term: string) => {
    setQ(term);
    if (!term) return setResults([]);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .ilike("username", `%${term}%`)
      .limit(10);
    if (error) return console.error(error);
    setResults((data || []).filter(p => p.id !== user?.id));
  };

  const requestContact = async (targetId: string) => {
    if (!user) return;
    const { error } = await supabase.from("contacts").insert({ owner_id: user.id, contact_id: targetId });
    if (error) return toast.error(error.message);
    toast.success("Request sent");
  };

  const startCall = async (targetId: string) => {
    if (!user) return;
    const { data: call, error } = await supabase.from("calls").insert({ created_by: user.id }).select("id").single();
    if (error || !call) return toast.error(error?.message || "Failed to create call");
    await supabase.from("call_participants").insert({ call_id: call.id, user_id: user.id, role: "caller" });
    // Notify callee on their user channel
    await supabase.channel(`user:${targetId}`).send({
      type: "broadcast",
      event: "notify",
      payload: { type: "ring", from: user.id, to: targetId, callId: call.id },
    });
    navigate(`/call/${call.id}`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <Card className="glass-card p-4 mb-6">
        <Input placeholder="Search by username..." value={q} onChange={(e) => search(e.target.value)} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((p) => (
          <Card key={p.id} className="glass-card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.display_name || p.username || "User"}</div>
              <div className="text-sm text-muted-foreground">@{p.username || "unknown"}</div>
            </div>
            <div className="flex gap-2">
              {!myContactIds.has(p.id) && (
                <Button variant="outline" onClick={() => requestContact(p.id)}>Add</Button>
              )}
              <Button onClick={() => startCall(p.id)}>Call</Button>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
