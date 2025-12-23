type InputRow = {
  id: string
  type: "text" | "select" | "textarea"
  label: string
  value: string
  options?: string[]
}

export type { InputRow }