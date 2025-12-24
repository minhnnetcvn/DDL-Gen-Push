"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColumnRowData } from "@/types/ColumnRowData"
import { Trash2 } from "lucide-react"


interface ColumnRowProps {
  row: ColumnRowData
  onUpdate: (id: string, field: keyof Omit<ColumnRowData, "id">, value: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export function ColumnRow({ row, onUpdate, onRemove, canRemove }: ColumnRowProps) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="p-4">
        <Input
          value={row.columnName}
          onChange={(e) => onUpdate(row.id, "columnName", e.target.value)}
          placeholder="e.g., user_id"
          required
        />
      </td>
      <td className="p-4">
        <Select value={row.type} onValueChange={(value) => onUpdate(row.id, "type", value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TIMESTAMP">Timestamp</SelectItem>
            <SelectItem value="BIGINT">BigINT</SelectItem>
            <SelectItem value="BINARY">Binary</SelectItem>
            <SelectItem value="FLOAT">Float</SelectItem>
            <SelectItem value="STRING">String</SelectItem>
            <SelectItem value="DOUBLE">Double</SelectItem>
            <SelectItem value="BOOLEAN">Boolean</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        <Select
          value={row.aggregateMethod}
          onValueChange={(value) => onUpdate(row.id, "aggregateMethod", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUM">SUM</SelectItem>
            <SelectItem value="COUNT">COUNT</SelectItem>
            <SelectItem value="AVG">AVG</SelectItem>
            <SelectItem value="MIN">MIN</SelectItem>
            <SelectItem value="MAX">MAX</SelectItem>
            <SelectItem value="FIRST_VALUE">FIRST VALUE</SelectItem>
            <SelectItem value="LAST_VALUE">LAST VALUE</SelectItem>
            <SelectItem value="ANY_VALUE">ANY VALUE</SelectItem>
            <SelectItem value="NONE">None</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(row.id)} disabled={!canRemove}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </td>
    </tr>
  )
}
