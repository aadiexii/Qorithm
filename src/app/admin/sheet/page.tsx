import { listSectionsForAdmin } from "@/features/sheet/admin-actions";
import { SheetMappingClient } from "@/features/sheet/components/sheet-mapping-client";

export default async function AdminSheetPage() {
  const sections = await listSectionsForAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Sheet Mapping</h1>
        <p className="text-sm text-muted-foreground">
          Map problems to CP Sheet sections and control their order.
        </p>
      </div>

      <SheetMappingClient sections={sections} />
    </div>
  );
}
