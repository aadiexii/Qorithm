import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth";

export default async function TopicsPage() {
  const session = await getCurrentSession();

  if (session?.user?.role === "admin") {
    redirect("/admin/topics");
  } else {
    redirect("/problems");
  }
}
