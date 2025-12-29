"use client"

import type React from "react"
import { Dispatch, SetStateAction, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { ETLConfigTable, type ETLConfig } from "@/components/ETLConfigTable"
import { Database, Search, Loader2, Plus, Trash2, Key } from "lucide-react"
import { ColumnType } from "@/types/ColumnType"
import { v4 as uuidv4 } from "uuid"
import { useUsername } from "@/context/usernameContext"
import PostgresConfig from "@/components/PostgresConfig"
import { DatabaseConfig } from "@/types/DatabaseConfig"
import { PostgresContextProvider, usePostgresConfig } from "@/context/postgresContext"
import QueryBuilder, { QueryData } from "@/components/QueryBuilder"

interface propsConfigDialogue {
    columnsConfig: ColumnType[];
    isDialogOpen: boolean;
    selectedRowId: number;
    
    setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
    setcolumnsConfig: Dispatch<SetStateAction<ColumnType[]>>;

    updateQuery: (rowId: number, postgresConfig: DatabaseConfig, queryData: any) => void
}

export default function ConfigDialogue(props: propsConfigDialogue) {
    const addInputRow = (type: "text" | "select" | "textarea") => {
        const newRow: ColumnType = {
            id: uuidv4(),
            key: "",
            value: "",
            dataType: type,
        }
        props.setcolumnsConfig([...props.columnsConfig, newRow])
    }

    const removeInputRow = (id: string) => {
        props.setcolumnsConfig(props.columnsConfig.filter((column) => column.id !== id))
    }

    const updateInputRowValue = (id: string, value: string) => {
        props.setcolumnsConfig(props.columnsConfig.map((column) => (column.id === id ? { ...column, value } : column)))
    }

    const updateInputRowKeyName = (id: string, newKeyName: string) => {
        props.setcolumnsConfig(props.columnsConfig.map((column) => (column.id === id ? { ...column, key: newKeyName } : column)))
    }

    async function handleDialogSave(selectedRowId: number | null, columnsConfig: ColumnType[], postgresConfig: DatabaseConfig) {
        console.log("Saving configuration for row ID:", selectedRowId);
        if (selectedRowId === null) {
            alert("No row selected for update.");
            return;
        }

        // Update DB Record
        props.updateQuery(selectedRowId, postgresConfig, columnsConfig)
        

        setIsDialogOpen(false)
    }

    return (
        <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
          <DialogContent className="w-[90vw] h-[90vh] overflow-hidden flex flex-col max-w-none max-h-none">
            <DialogHeader>
              <DialogTitle>Edit Row Configuration {selectedRowId !== null && `(ID: ${selectedRowId})`}</DialogTitle>
              <DialogDescription>
                Customize your input fields below. Click the add buttons to create new rows.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              {props.columnsConfig.map((column) => (
                <Card key={column.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`column-name-${column.id}`} className="min-w-[80px]">
                          Column Name:
                        </Label>
                        <Input
                          id={`column-name-${column.id}`}
                          value={column.key}
                          onChange={(e) => updateInputRowKeyName(column.id, e.target.value)}
                          className="flex-1"
                        />
                      </div>

                      <div className="space-y-2">
                        {column.dataType === "text" && (
                          <Input
                            id={`column-value-${column.id}`}
                            value={column.value}
                            onChange={(e) => updateInputRowValue(column.id, e.target.value)}
                            placeholder="Enter text..."
                          />
                        )}
                        {column.dataType === "select" && (
                          <Select value={column.value} onValueChange={(v) => updateInputRowValue(column.id, v)}>
                            <SelectTrigger id={`input-${column.id}`}>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {column.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {column.dataType === "textarea" && (
                          <Textarea
                            id={`input-${column.id}`}
                            value={column.value}
                            onChange={(e) => updateInputRowValue(column.key, e.target.value)}
                            placeholder="Enter multi-line text..."
                            rows={4}
                          />
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInputRow(column.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addInputRow("text")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Input
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addInputRow("select")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Select
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addInputRow("textarea")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Textarea
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleDialogSave(selectedRowId, columnsConfig)
                    setIsDialogOpen(false)
                  }}
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    )
}