"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

export function SchemaRegistryForm() {
  const [formData, setFormData] = useState({
    schemaRegistryUrl: "",
    tableName: "",
    outputFile: "",
    option: "",
  })
  const [errors, setErrors] = useState({
    schemaRegistryUrl: "",
    tableName: "",
    outputFile: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Regex patterns for validation
  const patterns = {
    // Matches IP:port or hostname:port (e.g., 192.168.1.1:8080, localhost:3000)
    schemaRegistryUrl:
      /^(https?:\/\/)?(localhost|[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}|[a-zA-Z0-9.-]+)(:\d{1,5})$/,
    // Alphanumeric with underscores, no spaces
    tableName: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    // Valid file path (Unix or Windows style)
    outputFile: /^([a-zA-Z]:)?[\\/]?[\w\-/\\.]+\.[a-zA-Z0-9]+$/,
  }

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return `${name.replace(/([A-Z])/g, " $1").trim()} is required`
    }

    switch (name) {
      case "schemaRegistryUrl":
        if (!patterns.schemaRegistryUrl.test(value)) {
          return "Enter a valid URL with port (e.g., localhost:8080 or 192.168.1.1:9092)"
        }
        break
      case "tableName":
        if (!patterns.tableName.test(value)) {
          return "Table name must start with a letter or underscore and contain only alphanumeric characters and underscores"
        }
        break
      case "outputFile":
        if (!patterns.outputFile.test(value)) {
          return "Enter a valid file path (e.g., /path/to/file.json or C:\\path\\file.csv)"
        }
        break
    }
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleOptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, option: value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {
      schemaRegistryUrl: validateField("schemaRegistryUrl", formData.schemaRegistryUrl),
      tableName: validateField("tableName", formData.tableName),
      outputFile: validateField("outputFile", formData.outputFile),
    }

    setErrors(newErrors)

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Success",
      description: "Schema registry configuration saved successfully!",
    })

    // Reset form
    setFormData({
      schemaRegistryUrl: "",
      tableName: "",
      outputFile: "",
      option: "",
    })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="schemaRegistryUrl">Schema Registry URL</Label>
        <Input
          id="schemaRegistryUrl"
          name="schemaRegistryUrl"
          type="text"
          placeholder="localhost:8081 or 192.168.1.1:9092"
          value={formData.schemaRegistryUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.schemaRegistryUrl ? "border-destructive" : ""}
        />
        {errors.schemaRegistryUrl && <p className="text-sm text-destructive">{errors.schemaRegistryUrl}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tableName">Table Name</Label>
        <Input
          id="tableName"
          name="tableName"
          type="text"
          placeholder="users_table or my_data_table"
          value={formData.tableName}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.tableName ? "border-destructive" : ""}
        />
        {errors.tableName && <p className="text-sm text-destructive">{errors.tableName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFile">Output File Path</Label>
        <Input
          id="outputFile"
          name="outputFile"
          type="text"
          placeholder="/path/to/output.json or C:\data\output.csv"
          value={formData.outputFile}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.outputFile ? "border-destructive" : ""}
        />
        {errors.outputFile && <p className="text-sm text-destructive">{errors.outputFile}</p>}
      </div>

      <div className="space-y-3">
        <Label>Option</Label>
        <RadioGroup value={formData.option} onValueChange={handleOptionChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="both" />
            <Label htmlFor="both" className="font-normal cursor-pointer">
              Both
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="goldonly" id="goldonly" />
            <Label htmlFor="goldonly" className="font-normal cursor-pointer">
              Gold only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="silveronly" id="silveronly" />
            <Label htmlFor="silveronly" className="font-normal cursor-pointer">
              Silver only
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
