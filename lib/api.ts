// EVE Frontier dApp API Client
// Uses NEXT_PUBLIC_API_BASE environment variable for all API calls

export interface Assembly {
  assembly_id: string
  name: string
  component_type: "Smart Storage Unit" | "Smart Gate" | "Smart Turret" | "Network Node"
  world_position: {
    system_id: string
    x: number
    y: number
    z: number
  }
  status?: string
  owner?: string
}

export interface ResolvedTarget {
  assembly_id: string
  name: string
  component_type: string
  coordinates: {
    system_id: string
    x: number
    y: number
    z: number
  }
}

export interface DraftActionPlan {
  actions: Array<{
    type: string
    target: string
    params: Record<string, unknown>
  }>
  estimated_cost?: number
  requires_confirmation?: boolean
}

export interface ChatResponse {
  session_id: string
  assistant_reply: string
  resolved_target?: ResolvedTarget
  draft_action_plan?: DraftActionPlan
  error?: string
}

export interface ApproveResponse {
  success: boolean
  signable_action_bundle?: SignableActionBundle
  error?: string
}

export interface SignableActionBundle {
  actions: Array<{
    type: string
    target: string
    params: Record<string, unknown>
  }>
  nonce: string
  timestamp: number
}

export interface AssemblyCallbackResponse {
  assembly: Assembly
  context: Record<string, unknown>
}

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "APIError"
  }
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE
  console.log("[v0] NEXT_PUBLIC_API_BASE value:", baseUrl)
  
  if (!baseUrl) {
    throw new APIError(
      "NEXT_PUBLIC_API_BASE environment variable is not set. Please configure your backend URL."
    )
  }
  
  // Validate that it's a proper URL
  if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
    throw new APIError(
      `NEXT_PUBLIC_API_BASE must be a full URL starting with http:// or https://. Current value: "${baseUrl}"`
    )
  }
  
  return baseUrl.replace(/\/$/, "") // Remove trailing slash if present
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.message || errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      )
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(
      "Unable to reach backend. Please check your connection and try again.",
      undefined,
      error
    )
  }
}

export const api = {
  // GET /api/assemblies - Fetch all available assemblies
  async getAssemblies(): Promise<Assembly[]> {
    return fetchAPI<Assembly[]>("/api/assemblies")
  },

  // POST /api/operator/chat - Send a command to the operator
  async chat(params: {
    session_id?: string | null
    wallet_address?: string | null
    message: string
    selected_target?: { assembly_id: string } | null
  }): Promise<ChatResponse> {
    return fetchAPI<ChatResponse>("/api/operator/chat", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  // POST /api/operator/approve - Approve the draft action plan
  async approve(params: {
    session_id: string
    wallet_address?: string | null
  }): Promise<ApproveResponse> {
    return fetchAPI<ApproveResponse>("/api/operator/approve", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  // POST /api/operator/reset-target - Clear the current target
  async resetTarget(params: {
    session_id: string
  }): Promise<{ success: boolean; message?: string }> {
    return fetchAPI<{ success: boolean; message?: string }>("/api/operator/reset-target", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  // POST /api/assembly/callback - Get assembly context
  async assemblyCallback(params: {
    assembly_id: string
  }): Promise<AssemblyCallbackResponse> {
    return fetchAPI<AssemblyCallbackResponse>("/api/assembly/callback", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },
}

export { APIError }
