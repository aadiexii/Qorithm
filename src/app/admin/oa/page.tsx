"use client";

import { useState, useEffect, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  Edit2,
  Building2,
  X,
  ExternalLink,
} from "lucide-react";

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
  listCompaniesForAdmin,
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
  listCompanySectionsForAdmin,
  createCompanySectionAction,
  updateCompanySectionAction,
  deleteCompanySectionAction,
  moveCompanySectionOrder,
  listSectionProblemsForAdmin,
  createOAProblemAction,
  deleteOAProblemAction,
  moveOAProblemOrder,
} from "@/components/actions";

type Company = {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  description: string | null;
  logo: string | null;
  isPublished: boolean;
  sectionCount: number;
};

type Section = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  description: string | null;
  isPublished: boolean;
  problemCount: number;
};

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  platform: "leetcode" | "gfg" | "codeforces";
  url: string;
  isPublished: boolean;
  orderIndex: number;
  isRequired?: boolean;
};

export default function AdminOAPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);

  const [isPending, startTransitionLocal] = useTransition();

  // Company Form State
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    slug: "",
    difficulty: "medium",
    description: "",
    logo: "",
    isPublished: true,
  });
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  // Section Form State
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({
    name: "",
    slug: "",
    description: "",
    isPublished: true,
  });
  const [showSectionForm, setShowSectionForm] = useState(false);

  // Problem Form State
  const [problemForm, setProblemForm] = useState<{
    title: string;
    slug: string;
    difficulty: "easy" | "medium" | "hard";
    platform: "leetcode" | "gfg" | "codeforces";
    url: string;
    isPublished: boolean;
  }>({
    title: "",
    slug: "",
    difficulty: "easy",
    platform: "leetcode",
    url: "",
    isPublished: true,
  });

  const loadInitialData = async () => {
    const list = await listCompaniesForAdmin();
    setCompanies(list);
    if (list.length > 0 && !activeCompanyId) {
      setActiveCompanyId(list[0].id);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      listCompanySectionsForAdmin(activeCompanyId).then((data) => {
        setSections(data);
        if (data.length > 0) {
          setActiveSectionId(data[0].id);
        } else {
          setActiveSectionId(null);
          setProblems([]);
        }
      });
    } else {
      setSections([]);
      setActiveSectionId(null);
      setProblems([]);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    if (activeSectionId) {
      listSectionProblemsForAdmin(activeSectionId).then((data) => {
        setProblems(data as Problem[]);
      });
    } else {
      setProblems([]);
    }
  }, [activeSectionId]);

  // --- Company Handler ---
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransitionLocal(async () => {
      let res;
      if (editingCompany) {
        res = await updateCompanyAction(editingCompany.id, {
          name: companyForm.name,
          slug: companyForm.slug,
          difficulty: companyForm.difficulty,
          description: companyForm.description,
          logo: companyForm.logo,
          isPublished: companyForm.isPublished,
        });
      } else {
        res = await createCompanyAction({
          name: companyForm.name,
          slug: companyForm.slug,
          difficulty: companyForm.difficulty,
          description: companyForm.description,
          logo: companyForm.logo,
          isPublished: companyForm.isPublished,
        });
      }

      if (res.success) {
        setShowCompanyForm(false);
        setEditingCompany(null);
        loadInitialData();
      } else {
        alert(res.error);
      }
    });
  };

  const handleEditCompany = (c: Company) => {
    setEditingCompany(c);
    setCompanyForm({
      name: c.name,
      slug: c.slug,
      difficulty: c.difficulty,
      description: c.description ?? "",
      logo: c.logo ?? "",
      isPublished: c.isPublished,
    });
    setShowCompanyForm(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    startTransitionLocal(async () => {
      const res = await deleteCompanyAction(id);
      if (res.success) {
        if (activeCompanyId === id) {
          setActiveCompanyId(null);
        }
        loadInitialData();
      } else {
        alert(res.error);
      }
    });
  };

  const handleToggleCompanyPublish = async (c: Company) => {
    startTransitionLocal(async () => {
      const res = await updateCompanyAction(c.id, {
        isPublished: !c.isPublished,
      });
      if (res.success) {
        loadInitialData();
      } else {
        alert(res.error);
      }
    });
  };

  // --- Section Handler ---
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompanyId) return;
    startTransitionLocal(async () => {
      let res;
      if (editingSection) {
        res = await updateCompanySectionAction(editingSection.id, {
          name: sectionForm.name,
          slug: sectionForm.slug,
          description: sectionForm.description,
          isPublished: sectionForm.isPublished,
        });
      } else {
        res = await createCompanySectionAction({
          companyId: activeCompanyId,
          name: sectionForm.name,
          slug: sectionForm.slug,
          description: sectionForm.description,
          isPublished: sectionForm.isPublished,
        });
      }

      if (res.success) {
        setShowSectionForm(false);
        setEditingSection(null);
        const data = await listCompanySectionsForAdmin(activeCompanyId);
        setSections(data);
        if (!activeSectionId && data.length > 0) {
          setActiveSectionId(data[0].id);
        }
      } else {
        alert(res.error);
      }
    });
  };

  const handleEditSection = (s: Section) => {
    setEditingSection(s);
    setSectionForm({
      name: s.name,
      slug: s.slug,
      description: s.description ?? "",
      isPublished: s.isPublished,
    });
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    if (!activeCompanyId) return;
    startTransitionLocal(async () => {
      const res = await deleteCompanySectionAction(id);
      if (res.success) {
        if (activeSectionId === id) {
          setActiveSectionId(null);
        }
        const data = await listCompanySectionsForAdmin(activeCompanyId);
        setSections(data);
      } else {
        alert(res.error);
      }
    });
  };

  const handleMoveSection = async (id: string, dir: "up" | "down") => {
    if (!activeCompanyId) return;
    startTransitionLocal(async () => {
      const res = await moveCompanySectionOrder(id, dir);
      if (res.success) {
        const data = await listCompanySectionsForAdmin(activeCompanyId);
        setSections(data);
      }
    });
  };

  const handleToggleSectionPublish = async (s: Section) => {
    if (!activeCompanyId) return;
    startTransitionLocal(async () => {
      const res = await updateCompanySectionAction(s.id, {
        isPublished: !s.isPublished,
      });
      if (res.success) {
        const data = await listCompanySectionsForAdmin(activeCompanyId);
        setSections(data);
      } else {
        alert(res.error);
      }
    });
  };

  // --- Problem Handler ---
  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSectionId) return;
    startTransitionLocal(async () => {
      const res = await createOAProblemAction(activeSectionId, {
        title: problemForm.title,
        slug: problemForm.slug,
        difficulty: problemForm.difficulty,
        platform: problemForm.platform,
        url: problemForm.url,
        isPublished: problemForm.isPublished,
      });

      if (res.success) {
        setProblemForm({
          title: "",
          slug: "",
          difficulty: "easy",
          platform: "leetcode",
          url: "",
          isPublished: true,
        });
        const data = await listSectionProblemsForAdmin(activeSectionId);
        setProblems(data as Problem[]);
      } else {
        alert(res.error);
      }
    });
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this problem?")) return;
    if (!activeSectionId) return;
    startTransitionLocal(async () => {
      const res = await deleteOAProblemAction(activeSectionId, id);
      if (res.success) {
        const data = await listSectionProblemsForAdmin(activeSectionId);
        setProblems(data as Problem[]);
      } else {
        alert(res.error);
      }
    });
  };

  const handleMoveProblem = async (id: string, dir: "up" | "down") => {
    if (!activeSectionId) return;
    startTransitionLocal(async () => {
      const res = await moveOAProblemOrder(activeSectionId, id, dir);
      if (res.success) {
        const data = await listSectionProblemsForAdmin(activeSectionId);
        setProblems(data as Problem[]);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            OA Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure companies, sections, and Online Assessment (OA) PYQs.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCompany(null);
            setCompanyForm({
              name: "",
              slug: "",
              difficulty: "medium",
              description: "",
              logo: "",
              isPublished: true,
            });
            setShowCompanyForm(true);
          }}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent/80 text-white text-xs font-semibold px-4 py-2"
        >
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {showCompanyForm && (
        <Card className="border-white/10 bg-[#0a0a0a]/95">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-white text-base">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </CardTitle>
              <CardDescription>
                Provide company parameters for curated roadmaps.
              </CardDescription>
            </div>
            <button
              onClick={() => setShowCompanyForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Company Name
                  </label>
                  <Input
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    placeholder="e.g. Google"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Slug
                  </label>
                  <Input
                    value={companyForm.slug}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, slug: e.target.value })
                    }
                    placeholder="e.g. google"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Difficulty Recommendation
                  </label>
                  <select
                    value={companyForm.difficulty}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        difficulty: e.target.value,
                      })
                    }
                    className="w-full bg-[#111111] border border-white/10 rounded-lg text-slate-200 text-sm px-3 py-2 outline-none focus:border-white/20"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Logo Image URL
                  </label>
                  <Input
                    value={companyForm.logo}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, logo: e.target.value })
                    }
                    placeholder="e.g. /images/companies/google.png"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tell users what to expect..."
                  rows={2}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg text-slate-200 text-sm p-3 outline-none focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="companyPublished"
                  checked={companyForm.isPublished}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      isPublished: e.target.checked,
                    })
                  }
                  className="rounded border-white/10 bg-[#111111] text-accent"
                />
                <label
                  htmlFor="companyPublished"
                  className="text-xs font-semibold text-slate-300"
                >
                  Published &amp; Publicly Visible
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompanyForm(false)}
                  className="text-xs border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent hover:bg-accent/80 text-white text-xs font-semibold px-4 py-2"
                >
                  Save Company
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showSectionForm && (
        <Card className="border-white/10 bg-[#0a0a0a]/95">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-white text-base">
                {editingSection ? "Edit Section" : "Add Section"}
              </CardTitle>
              <CardDescription>
                Define a content grouping section for this company.
              </CardDescription>
            </div>
            <button
              onClick={() => setShowSectionForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Section Name
                  </label>
                  <Input
                    value={sectionForm.name}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, name: e.target.value })
                    }
                    placeholder="e.g. Array &amp; Hashing"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Section Slug
                  </label>
                  <Input
                    value={sectionForm.slug}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, slug: e.target.value })
                    }
                    placeholder="e.g. arrays-hashing"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional section details..."
                  rows={2}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg text-slate-200 text-sm p-3 outline-none focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sectionPublished"
                  checked={sectionForm.isPublished}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      isPublished: e.target.checked,
                    })
                  }
                  className="rounded border-white/10 bg-[#111111] text-accent"
                />
                <label
                  htmlFor="sectionPublished"
                  className="text-xs font-semibold text-slate-300"
                >
                  Published &amp; Visible
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSectionForm(false)}
                  className="text-xs border-white/10 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-accent hover:bg-accent/80 text-white text-xs font-semibold px-4 py-2"
                >
                  Save Section
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Pane: Companies list */}
        <Card className="border-white/10 bg-[#0a0a0a]/95 lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Companies</CardTitle>
            <CardDescription>Select target company</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex max-h-[500px] flex-col overflow-y-auto">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between border-l-2 px-4 py-3 transition-colors ${
                    activeCompanyId === c.id
                      ? "border-accent bg-accent/5"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => setActiveCompanyId(c.id)}
                    className="flex flex-1 flex-col items-start gap-0.5 text-left text-sm"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> {c.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {c.sectionCount} sections · {c.difficulty}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleCompanyPublish(c)}
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        c.isPublished
                          ? "bg-white/5 text-slate-400 border border-white/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {c.isPublished ? "Live" : "Draft"}
                    </button>
                    <button
                      onClick={() => handleEditCompany(c)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(c.id)}
                      className="text-slate-400 hover:text-amber-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-muted-foreground p-6 text-center text-xs">
                  No companies added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Center Pane: Company Sections list */}
        <Card className="border-white/10 bg-[#0a0a0a]/95 lg:col-span-4">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white text-base">Sections</CardTitle>
              <CardDescription>Configure roadmaps segments</CardDescription>
            </div>
            {activeCompanyId && (
              <Button
                onClick={() => {
                  setEditingSection(null);
                  setSectionForm({
                    name: "",
                    slug: "",
                    description: "",
                    isPublished: true,
                  });
                  setShowSectionForm(true);
                }}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1.5"
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex max-h-[500px] flex-col overflow-y-auto">
              {sections.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between border-l-2 px-4 py-3 transition-colors ${
                    activeSectionId === s.id
                      ? "border-accent bg-accent/5"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => setActiveSectionId(s.id)}
                    className="flex flex-1 flex-col items-start gap-0.5 text-left text-sm"
                  >
                    <span className="font-semibold text-slate-200">
                      {idx + 1}. {s.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {s.problemCount} problems
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleSectionPublish(s)}
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold mr-1 ${
                        s.isPublished
                          ? "bg-white/5 text-slate-400 border border-white/10"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {s.isPublished ? "Live" : "Draft"}
                    </button>
                    <button
                      onClick={() => handleMoveSection(s.id, "up")}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(s.id, "down")}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleEditSection(s)}
                      className="text-slate-400 hover:text-white p-1 ml-1"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(s.id)}
                      className="text-slate-400 hover:text-amber-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-muted-foreground p-6 text-center text-xs">
                  {activeCompanyId
                    ? "No sections configured."
                    : "Select a company first."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Pane: OA problems list & Form */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="border-white/10 bg-[#0a0a0a]/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">
                Mapped Problems
              </CardTitle>
              <CardDescription>Problems in section catalog</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex max-h-[350px] flex-col overflow-y-auto divide-y divide-white/5">
                {problems.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-semibold">
                          {idx + 1}.
                        </span>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-200 font-medium hover:text-accent flex items-center gap-1 truncate"
                        >
                          {p.title} <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 pl-4 text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        <span>{p.platform}</span>
                        <span>·</span>
                        <span>{p.difficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMoveProblem(p.id, "up")}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMoveProblem(p.id, "down")}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(p.id)}
                        className="text-slate-400 hover:text-amber-400 p-1 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {problems.length === 0 && (
                  <p className="text-muted-foreground p-6 text-center text-xs">
                    {activeSectionId
                      ? "No problems mapped."
                      : "Select a section first."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {activeSectionId && (
            <Card className="border-white/10 bg-[#0a0a0a]/95">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">
                  Add OA Problem
                </CardTitle>
                <CardDescription>
                  Insert and map new assessment problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProblem} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Title
                    </label>
                    <Input
                      value={problemForm.title}
                      onChange={(e) =>
                        setProblemForm({
                          ...problemForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Median of Two Arrays"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Slug
                      </label>
                      <Input
                        value={problemForm.slug}
                        onChange={(e) =>
                          setProblemForm({
                            ...problemForm,
                            slug: e.target.value,
                          })
                        }
                        placeholder="median-two-arrays"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Difficulty
                      </label>
                      <select
                        value={problemForm.difficulty}
                        onChange={(e) =>
                          setProblemForm({
                            ...problemForm,
                            difficulty: e.target.value as "easy" | "medium" | "hard",
                          })
                        }
                        className="w-full bg-[#111111] border border-white/10 rounded-lg text-slate-200 text-xs px-3.5 py-2.5 outline-none"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Platform
                      </label>
                      <select
                        value={problemForm.platform}
                        onChange={(e) =>
                          setProblemForm({
                            ...problemForm,
                            platform: e.target.value as "leetcode" | "gfg" | "codeforces",
                          })
                        }
                        className="w-full bg-[#111111] border border-white/10 rounded-lg text-slate-200 text-xs px-3.5 py-2.5 outline-none"
                      >
                        <option value="leetcode">LeetCode</option>
                        <option value="gfg">GFG</option>
                        <option value="codeforces">Codeforces</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Problem URL
                      </label>
                      <Input
                        value={problemForm.url}
                        onChange={(e) =>
                          setProblemForm({ ...problemForm, url: e.target.value })
                        }
                        placeholder="https://leetcode.com/..."
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-accent hover:bg-accent/80 text-white text-xs font-semibold py-2.5 mt-2"
                  >
                    Add to Section
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
