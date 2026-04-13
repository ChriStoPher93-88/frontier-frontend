"use client"

import { useState, useCallback, createContext, useContext, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface WalletContextType {
  walletAddress: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signActionBundle: (bundle: SignableActionBundle) => Promise<SignedActionBundle>
}

interface SignableActionBundle {
  actions: Array<{
    type: string
    target: string
    params: Record<string, unknown>
  }>
  nonce: string
  timestamp: number
}

interface SignedActionBundle {
  bundle: SignableActionBundle
  signature: string
  signerAddress: string
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useEveVaultWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useEveVaultWallet must be used within an EveVaultWalletProvider")
  }
  return context
}

interface EveVaultWalletProviderProps {
  children: ReactNode
}

export function EveVaultWalletProvider({ children }: EveVaultWalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      // Check if EVE Vault is available in the browser
      const eveVault = (window as unknown as { eveVault?: { connect: () => Promise<{ address: string }> } }).eveVault
      
      if (eveVault) {
        // Real EVE Vault connection
        const result = await eveVault.connect()
        setWalletAddress(result.address)
      } else {
        // Mock connection for development/testing
        // In production, this would integrate with the actual EVE Vault SDK
        await new Promise(resolve => setTimeout(resolve, 1500))
        const mockAddress = `0x${Array.from({ length: 40 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`
        setWalletAddress(mockAddress)
      }
    } catch (error) {
      console.error("[v0] EVE Vault connection failed:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWalletAddress(null)
  }, [])

  const signActionBundle = useCallback(async (bundle: SignableActionBundle): Promise<SignedActionBundle> => {
    if (!walletAddress) {
      throw new Error("Wallet not connected")
    }

    const eveVault = (window as unknown as { eveVault?: { signBundle: (bundle: SignableActionBundle) => Promise<string> } }).eveVault

    if (eveVault) {
      // Real EVE Vault signing
      const signature = await eveVault.signBundle(bundle)
      return {
        bundle,
        signature,
        signerAddress: walletAddress,
      }
    } else {
      // Mock signing for development
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockSignature = `0x${Array.from({ length: 130 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`
      return {
        bundle,
        signature: mockSignature,
        signerAddress: walletAddress,
      }
    }
  }, [walletAddress])

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        isConnecting,
        connect,
        disconnect,
        signActionBundle,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

interface WalletConnectButtonProps {
  className?: string
}

export function WalletConnectButton({ className }: WalletConnectButtonProps) {
  const { walletAddress, isConnected, isConnecting, connect, disconnect } = useEveVaultWallet()
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)
    try {
      await connect()
      setShowDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <CheckCircle className="size-4 text-green-500" />
          <span className="font-mono text-sm text-foreground">
            {formatAddress(walletAddress)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className={className}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className={className}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="size-4" />
            Connect Eve Vault
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              Connect Eve Vault
            </DialogTitle>
            <DialogDescription>
              Connect your Eve Vault wallet to interact with Smart Assemblies on the Frontier network.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4" />
                {error}
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium text-foreground">What is Eve Vault?</h4>
              <p className="text-sm text-muted-foreground">
                Eve Vault is the official wallet for EVE Frontier. It allows you to securely sign transactions and interact with Smart Assemblies, Smart Storage Units, Smart Gates, Smart Turrets, and Network Nodes.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting to Eve Vault...
                </>
              ) : (
                <>
                  <Wallet className="size-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface SigningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bundle: SignableActionBundle | null
  onSign: () => Promise<void>
  isLoading: boolean
}

export function SigningDialog({ open, onOpenChange, bundle, onSign, isLoading }: SigningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sign Action Bundle</DialogTitle>
          <DialogDescription>
            Review and sign the following actions with your Eve Vault wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {bundle && (
            <div className="rounded-lg border border-border bg-input p-4">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {JSON.stringify(bundle, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onSign}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing...
                </>
              ) : (
                "Sign with Eve Vault"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
