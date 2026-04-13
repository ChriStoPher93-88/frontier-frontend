"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileCode2, 
  Target, 
  MapPin, 
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Zap
} from "lucide-react"
import type { Assembly, DraftActionPlan } from "@/lib/api"

interface ActionPlanPanelProps {
  target: Assembly | null
  plan: DraftActionPlan | null
  onApprove: () => Promise<void>
  isLoading: boolean
  isWalletConnected: boolean
}

export function ActionPlanPanel({ 
  target, 
  plan, 
  onApprove, 
  isLoading,
  isWalletConnected 
}: ActionPlanPanelProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "smart_storage_unit":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "smart_gate":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "smart_turret":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "network_node":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="flex h-fit flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <FileCode2 className="size-5 text-primary" />
          <CardTitle className="text-xl">Draft Action Plan</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        {/* Resolved Target */}
        {target ? (
          <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="size-4 text-primary" />
              Resolved Target
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{target.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getTypeColor(target.component_type)}`}
                >
                  {target.component_type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <MapPin className="mr-1 inline size-3" />
                  Coordinates
                </span>
                <span className="font-mono text-xs text-foreground">
                  {target.world_position.system_id}: [{target.world_position.x}, {target.world_position.y}, {target.world_position.z}]
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-4" />
              No target selected
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Send a command to resolve a Smart Assembly target
            </p>
          </div>
        )}

        {/* Action Plan JSON */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Zap className="size-4 text-primary" />
            Action Plan
          </div>
          
          {plan ? (
            <ScrollArea className="h-[300px] rounded-lg border border-border bg-input">
              <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs text-foreground">
                {JSON.stringify(plan, null, 2)}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
              <div className="text-center">
                <FileCode2 className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No draft plan yet
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Plans will appear here when ready
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Warnings */}
        {plan?.warnings && plan.warnings.length > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <AlertTriangle className="size-4 shrink-0 text-yellow-500" />
            <div className="text-xs">
              <p className="font-medium text-yellow-500">Warnings</p>
              {plan.warnings.map((warning, i) => (
                <p key={i} className="text-yellow-500/80">{warning}</p>
              ))}
            </div>
          </div>
        )}

        {/* Approve Button */}
        <Button
          onClick={onApprove}
          disabled={!plan || isLoading || !isWalletConnected}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : !isWalletConnected ? (
            <>Connect Eve Vault to approve</>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Approve &amp; Sign with Eve Vault
            </>
          )}
        </Button>
        
        {plan?.resolved_summary && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {plan.resolved_summary}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
