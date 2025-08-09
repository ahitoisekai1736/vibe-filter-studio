import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - VibeFilter Studio";
  }, []);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) return toast.error(error.message);
    toast.success("Signed in successfully");
    navigate("/", { replace: true });
  };

  return (
    <main className="container mx-auto px-4 py-16">
      <Card className="glass-card max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Don't have an account? <Link to="/auth/sign-up" className="underline">Sign up</Link>
        </p>
      </Card>
    </main>
  );
}
