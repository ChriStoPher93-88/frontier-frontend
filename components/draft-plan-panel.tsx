"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DraftPlanPanelProps {
  plan: Record<string, unknown> | null
}

export function DraftPlanPanel({ plan }: DraftPlanPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Draft Action Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-input p-4 text-sm font-mono text-foreground">
          {plan ? JSON.stringify(plan, null, 2) : "No draft plan yet."}
        </pre>
      </CardContent>
    </Card>
  )
}
