"use client"

import { useState, useEffect } from "react"
import { CommandForm } from "@/components/command-form"
import { PlanOutput } from "@/components/plan-output"
import { MetaInfo } from "@/components/meta-info"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

interface MetaData {
  stack_network: string
  stack_language: string
  wallet_provider: string
}

export default function HomePage() {
  const [meta, setMeta] = useState<MetaData | null>(null)
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState<string | null>(null)
  const [output, setOutput] = useState("No plan yet.")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch(`${API_BASE}/api/meta`)
        if (!res.ok) throw new Error("Failed to fetch metadata")
        const data = await res.json()
        setMeta(data)
      } catch {
        setMetaError("Could not connect to API server. Make sure your backend is running.")
      } finally {
        setMetaLoading(false)
      }
    }
    loadMeta()
  }, [])

  const handleGenerate = async (formData: {
    wallet: string
    componentType: string
    componentId: string
    label: string
    systemId: string
    coordLabel: string
    x: string
    y: string
    z: string
    coordSource: string
    command: string
  }) => {
    setIsGenerating(true)
    setOutput("Generating plan...")

    try {
      const body = {
        wallet_address: formData.wallet,
        command: formData.command,
        target: {
          component_type: formData.componentType,
          component_id: formData.componentId || null,
          label: formData.label || null,
          world_position: {
            system_id: formData.systemId,
            x: Number(formData.x),
            y: Number(formData.y),
            z: Number(formData.z),
            label: formData.coordLabel || null,
            source: formData.coordSource,
          },
        },
        current_config_snapshot: {},
      }

      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to generate plan")

      const data = await res.json()
      setOutput(JSON.stringify(data, null, 2))
    } catch {
      setOutput("Error: Could not generate plan. Make sure your backend is running.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-6 space-y-6">
        <MetaInfo meta={meta} loading={metaLoading} error={metaError} />
        <CommandForm onGenerate={handleGenerate} isLoading={isGenerating} />
        <PlanOutput output={output} />
      </div>
    </main>
  )
}
