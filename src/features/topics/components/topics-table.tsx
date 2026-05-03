"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteTopicButton } from "./delete-topic-button";
import { EditTopicForm } from "./edit-topic-form";
import type { TopicWithCount } from "@/features/topics/actions";

type TopicsTableProps = {
  topics: TopicWithCount[];
};

export function TopicsTable({ topics }: TopicsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>
          Topics{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({topics.length} total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No topics yet. Create one above to start tagging problems.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Problems</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow key={topic.id}>
                  {editingId === topic.id ? (
                    <TableCell colSpan={4}>
                      <EditTopicForm
                        topic={topic}
                        onCancel={() => setEditingId(null)}
                      />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {topic.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        {topic.usageCount === 0 ? (
                          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-500" title="Unused topic">
                            {topic.usageCount}
                          </span>
                        ) : (
                          topic.usageCount
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(topic.id)}
                          >
                            Edit
                          </Button>
                          <DeleteTopicButton
                            topicId={topic.id}
                            topicName={topic.name}
                            usageCount={topic.usageCount}
                          />
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
