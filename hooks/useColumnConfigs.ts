import { useState } from "react"
import { AggregateMethod, ColumnRowData } from "@/types/ColumnRowData"

export function useColumnsConfig() {
  const [columnsConfig, setColumnsConfig] = useState<ColumnRowData[]>([])

  const addColumn = (
    columnName: string = "",
    type: string = "",
    aggregateMethod: AggregateMethod = "LAST_VALUE"
  ) => {
    setColumnsConfig(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        columnName,
        type,
        aggregateMethod,
      },
    ])
  }

  const removeColumn = (id: string) => {
    setColumnsConfig(prev => prev.filter(row => row.id !== id))
  }

  const updateColumn = (
    id: string,
    field: keyof Omit<ColumnRowData, "id">,
    value: string
  ) => {
    setColumnsConfig(prev =>
      prev.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    )
  }

  const resetColumns = () => setColumnsConfig([])

  return {
    columnsConfig,
    setColumnsConfig,
    addColumn,
    removeColumn,
    updateColumn,
    resetColumns,
  }
}
