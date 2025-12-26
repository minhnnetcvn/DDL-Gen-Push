import { ColumnRowData } from "@/types/ColumnRowData"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus } from "lucide-react"
import { toast, useToast } from "@/hooks/useToast"
import { ColumnRow } from "@/components/ColumnRow"



interface ColumnBuilderProps {
    columnsConfig: ColumnRowData[];
    handleColumnsSubmit: (e: React.FormEvent) => void;
    addColumn: () => void;
    updateColumn: (id: string, field: keyof Omit<ColumnRowData, "id">, value: string) => void;
    removeColumn: (id: string) => void;
    isSubmittingColumns: boolean
}

export default function ColumnBuilder({columnsConfig, handleColumnsSubmit, addColumn, updateColumn, removeColumn, isSubmittingColumns}: ColumnBuilderProps) {
    const handleRemoveColumn = (id: string) => {
        if (columnsConfig.length === 1) {
            toast({
                title: "Cannot remove",
                description: "At least one row is required",
                variant: "destructive",
            });
            return
        }
        removeColumn(id);
    }
    
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Column Configuration</CardTitle>
                <CardDescription>Define columns with their names, data types, and aggregate methods</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleColumnsSubmit} className="space-y-6">
                    <div className="flex justify-end">
                    <Button type="button" onClick={() => addColumn()} size="sm">
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
                                onUpdate={updateColumn}
                                onRemove={() => handleRemoveColumn(aConfig.id)}
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