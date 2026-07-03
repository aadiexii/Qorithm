import { getRecentActivity } from "@/components/actions/activity-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import { UserPlus, CheckCircle } from "lucide-react";

export default async function AdminActivityPage() {
  const events = await getRecentActivity(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Activity</h1>
        <p className="text-muted-foreground mt-2">
          Real-time chronological feed of user signups and problem solves.
        </p>
      </div>

      <Card className="bg-card/80 border-border/60">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>
            Showing the last 100 platform events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="before:via-border relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:to-transparent md:before:mx-auto md:before:translate-x-0">
            {events.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No recent activity.
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                >
                  <div className="border-background bg-muted text-muted-foreground z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    {event.type === "signup" ? (
                      <UserPlus className="h-4 w-4 text-amber-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  <div className="border-border/60 bg-card/50 w-[calc(100%-4rem)] rounded border p-4 shadow-sm md:w-[calc(50%-2.5rem)]">
                    <div className="mb-1 flex items-center justify-between space-x-2">
                      <div className="text-foreground font-bold">
                        {event.type === "signup"
                          ? "New User"
                          : "Problem Solved"}
                      </div>
                      <time className="text-muted-foreground text-xs font-medium">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(event.timestamp)}
                      </time>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      <span className="text-foreground font-medium">
                        {event.user.name || event.user.email}
                      </span>
                      {event.type === "signup" ? (
                        " joined the platform."
                      ) : (
                        <>
                          {" solved "}
                          <span className="text-foreground font-medium">
                            {event.details?.problemTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
