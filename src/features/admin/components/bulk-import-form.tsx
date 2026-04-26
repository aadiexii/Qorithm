"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { bulkImportAction, type BulkImportResult } from "@/features/admin/actions";

export function BulkImportForm() {
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleImport() {
    if (!csvText.trim()) return;
    setResult(null);
    startTransition(() => {
      void (async () => {
        const res = await bulkImportAction(csvText);
        setResult(res);
        if (res.success && res.inserted > 0) setCsvText("");
      })();
    });
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Bulk Import</CardTitle>
        <CardDescription>
          Paste CSV with columns: title, source, rating, platform, externalContestId, externalProblemIndex, topics, isPublished
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-input">CSV Data</Label>
          <textarea
            id="csv-input"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            disabled={isPending}
            rows={10}
            placeholder={`title,source,rating,platform,externalContestId,externalProblemIndex,topics,isPublished\nWatermelon,Codeforces 4A,800,codeforces,4,A,arrays,true`}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </div>

        <Button onClick={handleImport} disabled={isPending || !csvText.trim()}>
          {isPending ? "Importing…" : "Import"}
        </Button>

        {result && (
          <div className={`rounded-md p-4 text-sm ${result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <p className="font-medium">{result.message}</p>
            {result.totalRows > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
                <li>Total rows: {result.totalRows}</li>
                <li>Inserted: {result.inserted}</li>
                <li>Failed: {result.failed}</li>
              </ul>
            )}
            {result.rowErrors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium">Row errors:</p>
                {result.rowErrors.map((re) => (
                  <p key={re.row} className="text-xs">
                    Row {re.row}: {re.errors.join("; ")}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
