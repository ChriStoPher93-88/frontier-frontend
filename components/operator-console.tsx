"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  Terminal, 
  User,
  Bot,
  Loader2,
  Zap
} from "lucide-react"
import type { Assembly } from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface OperatorConsoleProps {
  messages: Message[]
  assemblies: Assembly[]
  assembliesLoading: boolean
  selectedAssemblyId: string
  onSelectedAssemblyChange: (id: string) => void
  isLoading: boolean
  onSendCommand: (message: string) => Promise<void>
  onApproveAction: () => Promise<void>
  onResetTarget: () => Promise<void>
  hasActionPlan: boolean
  isWalletConnected: boolean
}

export function OperatorConsole({
  messages,
  assemblies,
  assembliesLoading,
  selectedAssemblyId,
  onSelectedAssemblyChange,
  isLoading,
  onSendCommand,
  onApproveAction,
  onResetTarget,
  hasActionPlan,
  isWalletConnected,
}: OperatorConsoleProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input
    setInput("")
    await onSendCommand(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const getAssemblyTypeColor = (type: string) => {
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
    <Card className="flex h-[700px] flex-col">
      <CardHeader className="shrink-0 border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-primary" />
            <CardTitle className="text-xl">Operator Console</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {messages.length} messages
          </Badge>
        </div>
        
        {/* Assembly Selector */}
        <div className="mt-4">
          <Select
            value={selectedAssemblyId}
            onValueChange={onSelectedAssemblyChange}
            disabled={assembliesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={assembliesLoading ? "Loading assemblies..." : "Select Smart Assembly (optional)"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                <span className="text-muted-foreground">Auto-detect from command</span>
              </SelectItem>
              {assemblies.map((assembly) => (
                <SelectItem
                  key={assembly.assembly_id}
                  value={assembly.assembly_id}
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${getAssemblyTypeColor(assembly.component_type)}`}
                    >
                      {assembly.component_type}
                    </Badge>
                    <span>{assembly.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {assembly.world_position.system_id}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Bot className="size-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Welcome to Operator Console
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Enter commands to control Smart Assemblies, Smart Storage Units, Smart Gates, Smart Turrets, and Network Nodes on the Frontier network.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Enable broker mode
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Check inventory
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Set gate access
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Bot className="size-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="size-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (e.g., 'Enable broker mode on Fuel Depot Alpha')"
              className="min-h-[80px] resize-none pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-2 right-2"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onApproveAction}
              disabled={!hasActionPlan || isLoading || !isWalletConnected}
              className="flex-1"
            >
              {!isWalletConnected ? (
                <>Connect wallet to approve</>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Approve Action
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onResetTarget}
              disabled={isLoading}
            >
              <RotateCcw className="size-4" />
              Clear Target
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
