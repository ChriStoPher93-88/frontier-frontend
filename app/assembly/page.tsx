"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
  EveVaultWalletProvider, 
  WalletConnectButton, 
  SigningDialog,
  useEveVaultWallet 
} from "@/components/eve-vault-wallet"
import { OperatorConsole } from "@/components/operator-console"
import { ActionPlanPanel } from "@/components/action-plan-panel"
import { AssemblyContextPanel } from "@/components/assembly-context-panel"
import { ConnectionStatus } from "@/components/connection-status"
import { api, type Assembly, type ChatResponse, type DraftActionPlan, type SignableActionBundle, type AssemblyCallbackResponse, APIError } from "@/lib/api"
import { AlertCircle, Terminal, Cpu } from "lucide-react"

function AssemblyPageContent() {
  const searchParams = useSearchParams()
  const { walletAddress, isConnected, signActionBundle } = useEveVaultWallet()
  
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Assembly data
  const [assemblies, setAssemblies] = useState<Assembly[]>([])
  const [assembliesLoading, setAssembliesLoading] = useState(true)
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string>("")
  const [assemblyContext, setAssemblyContext] = useState<AssemblyCallbackResponse | null>(null)
  
  // Chat state
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Action plan state
  const [resolvedTarget, setResolvedTarget] = useState<Assembly | null>(null)
  const [draftPlan, setDraftPlan] = useState<DraftActionPlan | null>(null)
  const [signableBundle, setSignableBundle] = useState<SignableActionBundle | null>(null)
  const [showSigningDialog, setShowSigningDialog] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  
  // Connection state
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  // Load assemblies on mount
  const loadAssemblies = useCallback(async () => {
    setAssembliesLoading(true)
    setConnectionError(null)
    try {
      const data = await api.getAssemblies()
      setAssemblies(data)
      setIsBackendConnected(true)
    } catch (error) {
      const message = error instanceof APIError 
        ? error.message 
        : "Unable to reach backend"
      setConnectionError(message)
      setIsBackendConnected(false)
    } finally {
      setAssembliesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssemblies()
  }, [loadAssemblies])

  // Handle assembly_id from query params
  useEffect(() => {
    const assemblyId = searchParams.get("assembly_id")
    if (assemblyId && isBackendConnected) {
      setSelectedAssemblyId(assemblyId)
      // Fetch assembly context
      api.assemblyCallback({ 
        assembly_id: assemblyId,
        event_type: "assembly_open"
      })
        .then(response => {
          setAssemblyContext(response)
          // Find the assembly in the list for display
          const assembly = assemblies.find(a => a.assembly_id === assemblyId)
          if (assembly) {
            setResolvedTarget(assembly)
          }
        })
        .catch(error => {
          console.error("[v0] Failed to load assembly context:", error)
        })
    }
  }, [searchParams, isBackendConnected, assemblies])

  // Send chat command
  const sendCommand = async (message: string) => {
    if (!message.trim()) return

    setIsLoading(true)
    setMessages(prev => [...prev, { role: "user", content: message }])

    try {
      const response: ChatResponse = await api.chat({
        session_id: sessionId,
        wallet_address: walletAddress,
        message,
        selected_target: selectedAssemblyId ? { assembly_id: selectedAssemblyId } : null,
      })

      if (response.session_id) {
        setSessionId(response.session_id)
      }

      setMessages(prev => [...prev, { role: "assistant", content: response.assistant_reply }])

      if (response.resolved_target) {
        setResolvedTarget(response.resolved_target)
      }

      if (response.draft_action_plan) {
        setDraftPlan(response.draft_action_plan)
      }

      setConnectionError(null)
    } catch (error) {
      const errorMessage = error instanceof APIError ? error.message : "Failed to send command"
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }])
      setConnectionError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Approve action plan
  const approveAction = async () => {
    if (!sessionId) {
      setConnectionError("No active session")
      return
    }

    if (!isConnected) {
      setConnectionError("Please connect your Eve Vault wallet first")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.approve({
        session_id: sessionId,
        wallet_address: walletAddress,
      })

      if (response.signable_action_bundle) {
        setSignableBundle(response.signable_action_bundle)
        setShowSigningDialog(true)
      }

      setConnectionError(null)
    } catch (error) {
      const errorMessage = error instanceof APIError ? error.message : "Failed to approve plan"
      setConnectionError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign action bundle
  const handleSign = async () => {
    if (!signableBundle) return

    setIsSigning(true)
    try {
      const signedBundle = await signActionBundle(signableBundle)
      console.log("[v0] Signed bundle:", signedBundle)
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Action signed successfully!\nSignature: ${signedBundle.signature.slice(0, 20)}...` 
      }])
      
      setShowSigningDialog(false)
      setSignableBundle(null)
      setDraftPlan(null)
    } catch (error) {
      console.error("[v0] Signing failed:", error)
      setConnectionError("Failed to sign action bundle")
    } finally {
      setIsSigning(false)
    }
  }

  // Reset target
  const resetTarget = async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      await api.resetTarget({ session_id: sessionId })
      setResolvedTarget(null)
      setDraftPlan(null)
      setAssemblyContext(null)
      setSelectedAssemblyId("")
      setMessages(prev => [...prev, { role: "assistant", content: "Target cleared successfully." }])
    } catch (error) {
      const errorMessage = error instanceof APIError ? error.message : "Failed to reset target"
      setConnectionError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Terminal className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Operator Console</h1>
              <p className="text-xs text-muted-foreground">EVE Frontier Smart Assembly Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectionStatus 
              isConnected={isBackendConnected} 
              isLoading={assembliesLoading}
              onRetry={loadAssemblies}
            />
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{connectionError}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4">
          {/* Assembly Context (if available) */}
          {assemblyContext && resolvedTarget && (
            <div className="mb-6">
              <AssemblyContextPanel 
                target={resolvedTarget} 
                context={assemblyContext} 
              />
            </div>
          )}

          {/* Two-panel layout */}
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Left Panel: Operator Chat */}
            <OperatorConsole
              messages={messages}
              assemblies={assemblies}
              assembliesLoading={assembliesLoading}
              selectedAssemblyId={selectedAssemblyId}
              onSelectedAssemblyChange={setSelectedAssemblyId}
              isLoading={isLoading}
              onSendCommand={sendCommand}
              onApproveAction={approveAction}
              onResetTarget={resetTarget}
              hasActionPlan={!!draftPlan}
              isWalletConnected={isConnected}
            />

            {/* Right Panel: Draft Action Plan */}
            <div className="flex flex-col gap-6">
              <ActionPlanPanel 
                target={resolvedTarget}
                plan={draftPlan}
                onApprove={approveAction}
                isLoading={isLoading}
                isWalletConnected={isConnected}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="size-3" />
            <span>Smart Assembly dApp for EVE Frontier</span>
          </div>
          <div>
            Session: {sessionId ? sessionId.slice(0, 8) : "Not started"}
          </div>
        </div>
      </footer>

      {/* Signing Dialog */}
      <SigningDialog
        open={showSigningDialog}
        onOpenChange={setShowSigningDialog}
        bundle={signableBundle}
        onSign={handleSign}
        isLoading={isSigning}
      />
    </div>
  )
}

export default function AssemblyPage() {
  return (
    <EveVaultWalletProvider>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading Operator Console...</span>
          </div>
        </div>
      }>
        <AssemblyPageContent />
      </Suspense>
    </EveVaultWalletProvider>
  )
}
