import { redirect } from "next/navigation";

// Redirect /admin -> /admin/dashboard
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
