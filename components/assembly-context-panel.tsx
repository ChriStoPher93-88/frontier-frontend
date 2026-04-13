"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Box, 
  MapPin, 
  Info,
  Cpu,
  Layers
} from "lucide-react"
import type { ResolvedTarget } from "@/lib/api"

interface AssemblyContextPanelProps {
  target: ResolvedTarget
  context: Record<string, unknown>
}

export function AssemblyContextPanel({ target, context }: AssemblyContextPanelProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Smart Storage Unit":
        return <Box className="size-5" />
      case "Smart Gate":
        return <Layers className="size-5" />
      case "Smart Turret":
        return <Cpu className="size-5" />
      case "Network Node":
        return <Cpu className="size-5" />
      default:
        return <Cpu className="size-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Smart Storage Unit":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Smart Gate":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Smart Turret":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Network Node":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg ${getTypeColor(target.component_type)}`}>
              {getTypeIcon(target.component_type)}
            </div>
            <div>
              <CardTitle className="text-lg">{target.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getTypeColor(target.component_type)}`}
                >
                  {target.component_type}
                </Badge>
                <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {target.coordinates.system_id}: [{target.coordinates.x}, {target.coordinates.y}, {target.coordinates.z}]
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Assembly Context</p>
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
