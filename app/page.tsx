import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth-session";
import { getRoleDestination } from "@/lib/auth-roles";

export default async function Home() {
  const session = await getCurrentSession();

  redirect(session ? getRoleDestination(session.user.role) : "/login");
}
