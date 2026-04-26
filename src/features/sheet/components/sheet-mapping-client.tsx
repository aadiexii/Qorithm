"use client";

import { useState, useEffect, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Search, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getSectionMappings,
  searchProblemsForMapping,
  addProblemToSection,
  removeProblemFromSection,
  moveProblemOrder,
} from "../admin-actions";

type Section = { id: string; title: string; slug: string };
type MappedProblem = Awaited<ReturnType<typeof getSectionMappings>>[0];
type SearchProblem = Awaited<ReturnType<typeof searchProblemsForMapping>>[0];

export function SheetMappingClient({ sections }: { sections: Section[] }) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sections[0]?.id ?? null);
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
      <Card className="md:col-span-4 bg-card/80">
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>Select a section to map problems</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col max-h-[600px] overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`text-left px-4 py-3 text-sm transition-colors border-l-2 ${
                  activeSectionId === section.id
                    ? "border-accent bg-accent/10 font-semibold text-accent"
                    : "border-transparent hover:bg-white/5 text-muted-foreground"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right Pane: Mappings */}
      <div className="md:col-span-8 flex flex-col gap-6">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Current Mappings</CardTitle>
            <CardDescription>
              Problems appear in this exact order in the section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mappings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
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
                      <TableRow key={m.problemId} className={isPending ? "opacity-50" : ""}>
                        <TableCell className="font-medium text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{m.title}</div>
                          <div className="text-xs text-muted-foreground">{m.source}</div>
                        </TableCell>
                        <TableCell>{m.rating ?? "-"}</TableCell>
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
                              className="h-8 w-8 px-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
            <CardDescription>Search and map a problem to this section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or source..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {isSearching ? (
                <div className="flex h-24 items-center justify-center">
                  <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? "No problems found." : "Type to search problems."}
                </p>
              ) : (
                searchResults.map((p) => {
                  const isMapped = mappings.some((m) => m.problemId === p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border border-border/40 p-3 hover:bg-white/5"
                    >
                      <div>
                        <div className="text-sm font-medium">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.source} • Rating: {p.rating ?? "N/A"}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={isMapped ? "outline" : "default"}
                        disabled={isMapped || isPending}
                        onClick={() => handleAdd(p.id)}
                      >
                        {isMapped ? "Mapped" : <><Plus className="h-4 w-4 mr-1" /> Add</>}
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
