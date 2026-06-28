import Link from "next/link";
import { ChevronRight } from "lucide-react";

type CompanyCardProps = {
  name: string;
  slug: string;
  logo: string | null;
  difficulty: string;
  description: string | null;
  sectionCount: number;
};

export function CompanyCard({
  name,
  slug,
  logo,
  difficulty,
  description,
  sectionCount,
}: CompanyCardProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/OA/${slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111111]"
    >
      <div>
        <div className="flex items-center justify-between">
          {/* Logo / Initials */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-bold text-white transition-all group-hover:scale-105 group-hover:bg-white/10">
            {logo ? (
              <img
                src={logo}
                alt={`${name} logo`}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <span className="text-accent text-sm font-bold transition-colors group-hover:text-white">
                {initials}
              </span>
            )}
          </div>

          {/* Difficulty Badge */}
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-300 uppercase">
            {difficulty}
          </span>
        </div>

        <h3 className="group-hover:text-accent mt-4 text-lg font-bold tracking-tight text-white transition-colors">
          {name}
        </h3>

        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold tracking-wider text-neutral-400 transition-colors group-hover:text-white">
        <span>{sectionCount} Sections</span>
        <div className="flex items-center gap-1">
          <span>View Roadmap</span>
          <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
