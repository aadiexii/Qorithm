import { redirect } from "next/navigation";
import { getCurrentSession } from "@/services/Auth/auth";

export default async function TopicsPage() {
  const session = await getCurrentSession();

  if (session?.user?.role === "admin") {
    redirect("/admin/oa");
  } else {
    redirect("/sheet");
  }
}
