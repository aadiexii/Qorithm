import { BulkImportForm } from "@/features/admin/components/bulk-import-form";

export default function AdminImportPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Bulk Import</h1>
        <p className="text-sm text-muted-foreground">
          Import multiple problems from CSV data. Invalid rows are skipped with per-row error
          details.
        </p>
      </div>

      <BulkImportForm />
    </div>
  );
}
