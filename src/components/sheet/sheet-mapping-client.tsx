"use client";

import { useState, useEffect, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Search, Trash2 } from "lucide-react";

import { Input } from "@/components/molecules/input";
import { Button } from "@/components/molecules/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import {
  getSectionMappings,
  searchProblemsForMapping,
  addProblemToSection,
  removeProblemFromSection,
  moveProblemOrder,
} from "@/components/actions";

type Section = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  problemCount: number;
};
type MappedProblem = Awaited<ReturnType<typeof getSectionMappings>>[0];
type SearchProblem = Awaited<ReturnType<typeof searchProblemsForMapping>>[0];

export function SheetMappingClient({ sections }: { sections: Section[] }) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [mappings, setMappings] = useState<MappedProblem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProblem[]>([]);
  const [isPending, startTransition] = useTransition();

  const [isSearching, setIsSearching] = useState(false);

  const loadMappings = async (sectionId: string) => {
    const data = await getSectionMappings(sectionId);
    setMappings(data);
  };

  useEffect(() => {
    if (activeSectionId) {
      loadMappings(activeSectionId);
    } else {
      setMappings([]);
    }
  }, [activeSectionId]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchProblemsForMapping(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = (problemId: string) => {
    if (!activeSectionId) return;
    startTransition(async () => {
      const res = await addProblemToSection(activeSectionId, problemId);
      if (res.success) {
        await loadMappings(activeSectionId);
      } else {
        alert(res.error);
      }
    });
  };

  const handleRemove = (problemId: string) => {
    if (!activeSectionId) return;
    if (!confirm("Remove this problem from the section?")) return;
    startTransition(async () => {
      await removeProblemFromSection(activeSectionId, problemId);
      await loadMappings(activeSectionId);
    });
  };

  const handleMove = (problemId: string, direction: "up" | "down") => {
    if (!activeSectionId) return;
    startTransition(async () => {
      await moveProblemOrder(activeSectionId, problemId, direction);
      await loadMappings(activeSectionId);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      {/* Left Pane: Sections */}
      <Card className="bg-card/80 md:col-span-4">
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>Select a section to map problems</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex max-h-[600px] flex-col overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`flex flex-col gap-1 border-l-2 px-4 py-3 text-left text-sm transition-colors ${
                  activeSectionId === section.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "text-muted-foreground border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={
                      activeSectionId === section.id
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {section.title}
                  </span>
                  {!section.isPublished && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{section.problemCount} problems</span>
                  {section.problemCount === 0 && (
                    <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                      Empty
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Pane: Mappings */}
      <div className="flex flex-col gap-6 md:col-span-8">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Current Mappings</CardTitle>
            <CardDescription>
              Problems appear in this exact order in the section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappings.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No problems mapped yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Order</TableHead>
                      <TableHead>Problem</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappings.map((m, i) => (
                      <TableRow
                        key={m.problemId}
                        className={isPending ? "opacity-50" : ""}
                      >
                        <TableCell className="text-muted-foreground font-medium">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{m.title}</div>
                          <div className="text-muted-foreground text-xs">
                            {m.source}
                          </div>
                        </TableCell>
                        <TableCell>
                          {m.rating ??
                            (m.platform === "atcoder" && m.externalDifficulty
                              ? `${m.externalDifficulty} (AC)`
                              : "-")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 px-0"
                              onClick={() => handleMove(m.problemId, "up")}
                              disabled={i === 0 || isPending}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 px-0"
                              onClick={() => handleMove(m.problemId, "down")}
                              disabled={i === mappings.length - 1 || isPending}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 px-0 text-red-400 hover:bg-red-400/10 hover:text-red-300"
                              onClick={() => handleRemove(m.problemId)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Problem Panel */}
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Add Problem</CardTitle>
            <CardDescription>
              Search and map a problem to this section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                placeholder="Search by title or source..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[300px] space-y-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-muted-foreground animate-pulse text-sm">
                    Searching...
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  {searchQuery
                    ? "No problems found."
                    : "Type to search problems."}
                </p>
              ) : (
                searchResults.map((p) => {
                  const isMapped = mappings.some((m) => m.problemId === p.id);
                  return (
                    <div
                      key={p.id}
                      className="border-border/40 flex items-center justify-between rounded-md border p-3 hover:bg-white/5"
                    >
                      <div>
                        <div className="text-sm font-medium">{p.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {p.source} • Rating:{" "}
                          {p.rating ??
                            (p.platform === "atcoder" && p.externalDifficulty
                              ? `${p.externalDifficulty} (AC)`
                              : "N/A")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isMapped ? "outline" : "default"}
                        disabled={isMapped || isPending}
                        onClick={() => handleAdd(p.id)}
                      >
                        {isMapped ? (
                          "Mapped"
                        ) : (
                          <>
                            <Plus className="mr-1 h-4 w-4" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
