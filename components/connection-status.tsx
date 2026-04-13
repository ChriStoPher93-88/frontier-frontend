"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Loader2
} from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  isLoading: boolean
  onRetry: () => void
}

export function ConnectionStatus({ isConnected, isLoading, onRetry }: ConnectionStatusProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
        <Loader2 className="size-3 animate-spin" />
        <span className="text-xs">Connecting...</span>
      </Badge>
    )
  }

  if (isConnected) {
    return (
      <Badge 
        variant="outline" 
        className="gap-1.5 border-green-500/30 bg-green-500/10 px-3 py-1.5 text-green-400"
      >
        <Wifi className="size-3" />
        <span className="text-xs">Backend Connected</span>
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className="gap-1.5 border-destructive/30 bg-destructive/10 px-3 py-1.5 text-destructive"
      >
        <WifiOff className="size-3" />
        <span className="text-xs">Disconnected</span>
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRetry}
        className="size-8"
      >
        <RefreshCw className="size-4" />
        <span className="sr-only">Retry connection</span>
      </Button>
    </div>
  )
}
