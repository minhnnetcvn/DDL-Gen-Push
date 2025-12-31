import type React from "react"
import { useState } from "react"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { toast, useToast } from "@/hooks/useToast"

import { ColumnRow } from "@/components/ColumnRow"

import { ColumnRowData } from "@/types/ColumnRowData"
import {TableTypes} from "@/types/TableConfig"


interface ColumnBuilderProps {
    columnsConfig: ColumnRowData[];
    isSubmittingColumns: boolean;
    
    submitColumns: (tableType: TableTypes) => void;
    
    addColumn: () => void;
    updateColumn: (id: string, field: keyof Omit<ColumnRowData, "id">, value: string) => void;
    removeColumn: (id: string) => void;

}

export default function ColumnBuilder(props : ColumnBuilderProps) {
    const [tableType, setTableType] = useState<TableTypes>("dim")

    const handleRemoveColumn = (id: string) => {
        if (props.columnsConfig.length === 1) {
            toast({
                title: "Cannot remove",
                description: "At least one row is required",
                variant: "destructive",
            });
            return
        }
        props.removeColumn(id);
    }

    const handleColumnsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        props.submitColumns(tableType);
    }

    const handleTableTypeChange = (val: TableTypes) => {
        setTableType(val)
    }
    
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Step 2: Column Configuration</CardTitle>
                <CardDescription>Define columns with their names, data types, and aggregate methods</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleColumnsSubmit} className="space-y-6">
                    <div className="flex justify-between">
                        <div className="flex items-center justify-around h-6 gap-4">
                        <Label htmlFor="table-type" className="text-sm font-medium">
                            Table Type (For Gold)
                        </Label>
                        <Select value={tableType} onValueChange={handleTableTypeChange}>
                            <SelectTrigger id="table-type" className="w-60">
                            <SelectValue placeholder="Select table type..." />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="dim">Dimension Table</SelectItem>
                            <SelectItem value="fact">Fact Table</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                        <Button type="button" onClick={() => props.addColumn()} size="sm">
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
                            {props.columnsConfig.map((aConfig) => (
                            <ColumnRow
                                key={aConfig.id}
                                row={aConfig}
                                onUpdate={props.updateColumn}
                                onRemove={() => handleRemoveColumn(aConfig.id)}
                                canRemove={props.columnsConfig.length > 1}
                            />
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </div>

                    <div className="flex justify-end">
                    <Button type="submit" disabled={props.isSubmittingColumns}>
                        {props.isSubmittingColumns ? "Submitting..." : "Save Configuration"}
                    </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}