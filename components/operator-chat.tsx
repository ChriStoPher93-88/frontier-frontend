"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface Assembly {
  assembly_id: string
  name: string
  component_type: string
  world_position: {
    system_id: string
    x: number
    y: number
    z: number
  }
}

interface ChatResponse {
  [key: string]: unknown
}

interface OperatorChatProps {
  backendUrl: string
  onBackendUrlChange: (url: string) => void
  walletAddress: string
  onWalletAddressChange: (address: string) => void
  assemblies: Assembly[]
  assembliesLoading: boolean
  selectedAssemblyId: string
  onSelectedAssemblyChange: (id: string) => void
  message: string
  onMessageChange: (message: string) => void
  reply: ChatResponse | null
  isLoading: boolean
  onSendChat: () => void
  onApprovePlan: () => void
  onResetTarget: () => void
}

export function OperatorChat({
  backendUrl,
  onBackendUrlChange,
  walletAddress,
  onWalletAddressChange,
  assemblies,
  assembliesLoading,
  selectedAssemblyId,
  onSelectedAssemblyChange,
  message,
  onMessageChange,
  reply,
  isLoading,
  onSendChat,
  onApprovePlan,
  onResetTarget,
}: OperatorChatProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Operator Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Backend URL</FieldLabel>
            <Input
              value={backendUrl}
              onChange={(e) => onBackendUrlChange(e.target.value)}
              placeholder="http://localhost:8000"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Wallet Address</FieldLabel>
              <Input
                value={walletAddress}
                onChange={(e) => onWalletAddressChange(e.target.value)}
                placeholder="Optional for MVP"
              />
            </Field>
            <Field>
              <FieldLabel>Selected Assembly</FieldLabel>
              <Select
                value={selectedAssemblyId}
                onValueChange={onSelectedAssemblyChange}
                disabled={assembliesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect from message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect from message</SelectItem>
                  {assemblies.map((assembly) => {
                    const pos = assembly.world_position
                    return (
                      <SelectItem
                        key={assembly.assembly_id}
                        value={assembly.assembly_id}
                      >
                        {assembly.name} — {assembly.component_type} —{" "}
                        {pos.system_id}:{pos.x},{pos.y},{pos.z}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Message</FieldLabel>
            <Textarea
              rows={5}
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Enter your command..."
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSendChat} disabled={isLoading} className="flex-1">
              {isLoading ? "Sending..." : "Send Command"}
            </Button>
            <Button
              onClick={onApprovePlan}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              Approve Draft Plan
            </Button>
            <Button
              onClick={onResetTarget}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              Clear Current Target
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Assistant Reply
            </h3>
            <pre className="whitespace-pre-wrap break-words rounded-lg border border-border bg-input p-4 text-sm font-mono text-foreground">
              {reply ? JSON.stringify(reply, null, 2) : "No response yet."}
            </pre>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
