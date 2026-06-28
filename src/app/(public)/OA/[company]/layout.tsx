import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to Clerk sign-in if unauthenticated
  if (!session.userId) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
