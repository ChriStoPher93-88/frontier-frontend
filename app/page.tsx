"use client"

import { useState, useEffect, useCallback } from "react"
import { OperatorChat } from "@/components/operator-chat"
import { DraftPlanPanel } from "@/components/draft-plan-panel"

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

interface DraftActionPlan {
  [key: string]: unknown
}

interface ChatResponse {
  session_id?: string
  message?: string
  draft_action_plan?: DraftActionPlan
  error?: string
  [key: string]: unknown
}

const DEFAULT_BACKEND_URL = "http://localhost:8000"

export default function HomePage() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [assemblies, setAssemblies] = useState<Assembly[]>([])
  const [selectedAssemblyId, setSelectedAssemblyId] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [message, setMessage] = useState("Enable broker mode on Fuel Depot Alpha")
  const [reply, setReply] = useState<ChatResponse | null>(null)
  const [draftPlan, setDraftPlan] = useState<DraftActionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [assembliesLoading, setAssembliesLoading] = useState(false)

  // Load backend URL from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("frontier_backend_url")
    if (saved) {
      setBackendUrl(saved)
    }
  }, [])

  // Save backend URL to localStorage when it changes
  const handleBackendUrlChange = (url: string) => {
    setBackendUrl(url)
    localStorage.setItem("frontier_backend_url", url.trim())
  }

  // Load assemblies from backend
  const loadAssemblies = useCallback(async () => {
    setAssembliesLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/assemblies`)
      if (!res.ok) throw new Error("Failed to fetch assemblies")
      const data = await res.json()
      setAssemblies(data)
    } catch (error) {
      setReply({
        error: "Unable to load assemblies",
        detail: String(error),
      })
    } finally {
      setAssembliesLoading(false)
    }
  }, [backendUrl])

  useEffect(() => {
    loadAssemblies()
  }, [loadAssemblies])

  const sendChat = async () => {
    setIsLoading(true)
    try {
      const selectedTarget = selectedAssemblyId
        ? { assembly_id: selectedAssemblyId }
        : null

      const res = await fetch(`${backendUrl}/api/operator/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          wallet_address: walletAddress || null,
          message,
          selected_target: selectedTarget,
        }),
      })

      const data: ChatResponse = await res.json()
      if (data.session_id) {
        setSessionId(data.session_id)
      }
      setReply(data)
      if (data.draft_action_plan) {
        setDraftPlan(data.draft_action_plan)
      }
    } catch (error) {
      setReply({
        error: "Failed to send command",
        detail: String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const approvePlan = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/operator/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json()
      setReply(data)
    } catch (error) {
      setReply({
        error: "Failed to approve plan",
        detail: String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetTarget = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/operator/reset-target`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
      const data = await res.json()
      setReply(data)
      setDraftPlan(null)
    } catch (error) {
      setReply({
        error: "Failed to reset target",
        detail: String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Frontier Operator Console
          </h1>
          <p className="mt-2 text-muted-foreground">
            Custom dApp target for Smart Assembly command control. Uses Frontier
            terms: Smart Storage Unit, Smart Gate, Smart Turret, Network Node,
            Regional market, Eve Vault.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <OperatorChat
            backendUrl={backendUrl}
            onBackendUrlChange={handleBackendUrlChange}
            walletAddress={walletAddress}
            onWalletAddressChange={setWalletAddress}
            assemblies={assemblies}
            assembliesLoading={assembliesLoading}
            selectedAssemblyId={selectedAssemblyId}
            onSelectedAssemblyChange={setSelectedAssemblyId}
            message={message}
            onMessageChange={setMessage}
            reply={reply}
            isLoading={isLoading}
            onSendChat={sendChat}
            onApprovePlan={approvePlan}
            onResetTarget={resetTarget}
          />
          <DraftPlanPanel plan={draftPlan} />
        </div>
      </div>
    </main>
  )
}
