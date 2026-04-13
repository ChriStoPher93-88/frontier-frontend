// EVE Frontier dApp API Client
// Uses NEXT_PUBLIC_API_BASE environment variable for all API calls

export interface WorldPosition {
  system_id: string
  x: number
  y: number
  z: number
  label?: string
  source?: string
}

export interface Assembly {
  assembly_id: string
  name: string
  component_type: "smart_storage_unit" | "smart_gate" | "smart_turret" | "network_node"
  world_position: WorldPosition
  status?: string
  owner?: string
}

export interface Target {
  component_type?: string
  assembly_id?: string
  world_position?: WorldPosition
  label?: string
}

export interface DraftActionPlan {
  target: Assembly
  resolved_summary: string
  warnings: string[]
  signing_actions: string[]
  command_family: string
  intent: string
  policy: Record<string, unknown>
  market_scope?: {
    reference_type: string
  }
}

export interface ChatResponse {
  session_id: string
  assistant_reply: string
  clarification_required: boolean
  resolved_target?: Assembly
  draft_action_plan?: DraftActionPlan
  error?: string
}

export interface SignableActionBundle {
  bundle_type: string
  target_assembly_id: string
  component_type: string
  world_position: WorldPosition
  action_plan: DraftActionPlan
}

export interface ApproveResponse {
  status: string
  signable_action_bundle?: SignableActionBundle
  error?: string
}

export interface AssemblyCallbackResponse {
  assembly_id: string
  component_type: string
  world_position: WorldPosition
  event_type: string
  operator_prompt: string
  supported_commands: string[]
}

export interface HealthResponse {
  status: string
  service: string
  allowed_origins: string[]
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
  // GET /health - Health check endpoint
  async health(): Promise<HealthResponse> {
    return fetchAPI<HealthResponse>("/health")
  },

  // GET /api/assemblies - Fetch all available assemblies
  async getAssemblies(): Promise<Assembly[]> {
    return fetchAPI<Assembly[]>("/api/assemblies")
  },

  // POST /api/operator/chat - Send a command to the operator
  async chat(params: {
    session_id?: string | null
    wallet_address?: string | null
    message: string
    selected_target?: Target | null
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
  }): Promise<{ status: string }> {
    return fetchAPI<{ status: string }>("/api/operator/reset-target", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  // POST /api/assembly/callback - Get assembly context for an assembly
  async assemblyCallback(params: {
    assembly_id: string
    event_type: "assembly_open" | "status_poll" | "command_sync"
    wallet_address?: string | null
    payload?: Record<string, unknown>
  }): Promise<AssemblyCallbackResponse> {
    return fetchAPI<AssemblyCallbackResponse>("/api/assembly/callback", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },
}

export { APIError }
