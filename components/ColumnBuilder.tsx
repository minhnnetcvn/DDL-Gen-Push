import { ColumnRowData } from "@/types/ColumnRowData"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ColumnRow } from "@/components/ColumnRow"



interface ColumnBuilderProps {
    columnsConfig: ColumnRowData[];
    handleColumnsSubmit: (e: React.FormEvent) => void;
    addRow: () => void;
    updateRow: (id: string, field: keyof Omit<ColumnRowData, "id">, value: string) => void;
    removeRow: (id: string) => void;
    isSubmittingColumns: boolean
}

export default function ColumnBuilder({columnsConfig, handleColumnsSubmit, addRow, updateRow, removeRow, isSubmittingColumns}: ColumnBuilderProps) {
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Column Configuration</CardTitle>
                <CardDescription>Define columns with their names, data types, and aggregate methods</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleColumnsSubmit} className="space-y-6">
                    <div className="flex justify-end">
                    <Button type="button" onClick={() => addRow()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                    </Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                            <th className="text-left p-4 font-medium text-sm">Column Name</th>
                            <th className="text-left p-4 font-medium text-sm">Type</th>
                            <th className="text-left p-4 font-medium text-sm">Aggregate Method</th>
                            <th className="w-16 p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {columnsConfig.map((aConfig) => (
                            <ColumnRow
                                key={aConfig.id}
                                row={aConfig}
                                onUpdate={updateRow}
                                onRemove={removeRow}
                                canRemove={columnsConfig.length > 1}
                            />
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>

                    <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmittingColumns}>
                        {isSubmittingColumns ? "Submitting..." : "Submit Configuration"}
                    </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}