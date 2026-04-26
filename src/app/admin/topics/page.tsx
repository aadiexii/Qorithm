import { queryTopics } from "@/features/topics/actions";
import { CreateTopicForm } from "@/features/topics/components/create-topic-form";
import { TopicsTable } from "@/features/topics/components/topics-table";

export default async function AdminTopicsPage() {
  const allTopics = await queryTopics();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Topic Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage topics used to tag and filter problems.
        </p>
      </div>

      <CreateTopicForm />

      <TopicsTable topics={allTopics} />
    </div>
  );
}
