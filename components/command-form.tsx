"use client"

import { useState } from "react"
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

interface FormData {
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
}

interface CommandFormProps {
  onGenerate: (data: FormData) => void
  isLoading: boolean
}

export function CommandForm({ onGenerate, isLoading }: CommandFormProps) {
  const [formData, setFormData] = useState<FormData>({
    wallet: "0x-demo-wallet",
    componentType: "smart_storage_unit",
    componentId: "ssu-alpha",
    label: "Ore Depot Alpha",
    systemId: "stillness-001",
    coordLabel: "Ore Depot Alpha",
    x: "1250",
    y: "-340",
    z: "8820",
    coordSource: "world_api",
    command: "Lock the Smart Storage Unit to quartermasters only.",
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onGenerate(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Generate Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Wallet Address</FieldLabel>
            <Input
              value={formData.wallet}
              onChange={(e) => handleChange("wallet", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Component Type</FieldLabel>
            <Select
              value={formData.componentType}
              onValueChange={(value) => handleChange("componentType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart_storage_unit">Smart Storage Unit</SelectItem>
                <SelectItem value="smart_gate">Smart Gate</SelectItem>
                <SelectItem value="smart_turret">Smart Turret</SelectItem>
                <SelectItem value="network_node">Network Node</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Component ID</FieldLabel>
            <Input
              value={formData.componentId}
              onChange={(e) => handleChange("componentId", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Label</FieldLabel>
            <Input
              value={formData.label}
              onChange={(e) => handleChange("label", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>System ID</FieldLabel>
              <Input
                value={formData.systemId}
                onChange={(e) => handleChange("systemId", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Coordinate Label</FieldLabel>
              <Input
                value={formData.coordLabel}
                onChange={(e) => handleChange("coordLabel", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field>
              <FieldLabel>X</FieldLabel>
              <Input
                value={formData.x}
                onChange={(e) => handleChange("x", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Y</FieldLabel>
              <Input
                value={formData.y}
                onChange={(e) => handleChange("y", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Z</FieldLabel>
              <Input
                value={formData.z}
                onChange={(e) => handleChange("z", e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Coordinate Source</FieldLabel>
            <Select
              value={formData.coordSource}
              onValueChange={(value) => handleChange("coordSource", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="world_api">world_api</SelectItem>
                <SelectItem value="wallet_asset">wallet_asset</SelectItem>
                <SelectItem value="manual">manual</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Command</FieldLabel>
            <Textarea
              rows={4}
              value={formData.command}
              onChange={(e) => handleChange("command", e.target.value)}
            />
          </Field>

          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Generating..." : "Generate Plan"}
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
