"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MetaData {
  stack_network: string
  stack_language: string
  wallet_provider: string
}

interface MetaInfoProps {
  meta: MetaData | null
  loading: boolean
  error: string | null
}

export function MetaInfo({ meta, loading, error }: MetaInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Frontier Command MVP</CardTitle>
        <CardDescription>
          Coordinate-aware command console starter for Smart Assemblies, using current EVE Frontier terminology.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-muted-foreground">Loading metadata...</p>
        )}
        {error && (
          <p className="text-destructive-foreground">{error}</p>
        )}
        {meta && (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">Network:</span>{" "}
              <span className="text-muted-foreground">{meta.stack_network}</span>
            </p>
            <p>
              <span className="font-semibold">Language:</span>{" "}
              <span className="text-muted-foreground">{meta.stack_language}</span>
            </p>
            <p>
              <span className="font-semibold">Wallet Provider:</span>{" "}
              <span className="text-muted-foreground">{meta.wallet_provider}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
