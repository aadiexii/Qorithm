import { getRecentActivity } from "@/features/admin/activity-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          <CardDescription>Showing the last 100 platform events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {event.type === "signup" ? (
                      <UserPlus className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border/60 bg-card/50 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-foreground">
                        {event.type === "signup" ? "New User" : "Problem Solved"}
                      </div>
                      <time className="text-xs font-medium text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }).format(event.timestamp)}
                      </time>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{event.user.name || event.user.email}</span>
                      {event.type === "signup" ? (
                        " joined the platform."
                      ) : (
                        <>
                          {" solved "}
                          <span className="font-medium text-foreground">{event.details?.problemTitle}</span>
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
