import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  return children;
}
