"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlanOutputProps {
  output: string
}

export function PlanOutput({ output }: PlanOutputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Plan Output</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-input p-4 text-sm font-mono">
          {output}
        </pre>
      </CardContent>
    </Card>
  )
}
