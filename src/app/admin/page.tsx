import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { AdminDashboard } from "./dashboard";

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
