"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ETLConfigTable, type ETLConfig } from "@/components/etl-config-table"
import { Database, Search, Loader2, Plus, Trash2 } from "lucide-react"

export default function DBExplorerPage() {
  const { toast } = useToast()
  const [dbConfigured, setDbConfigured] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [results, setResults] = useState<ETLConfig[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [inputRows, setInputRows] = useState<InputRow[]>([
    { id: "1", type: "text", label: "Single Line Input", value: "" },
    { id: "2", type: "select", label: "Select Option", value: "", options: ["Option 1", "Option 2", "Option 3"] },
    { id: "3", type: "textarea", label: "Multi-line Input", value: "" },
  ])
  
  
  const [dbData, setDbData] = useState({
    host: "10.8.75.82",
    port: "5432",
    username: "postgres",
    password: "postgres",
    database: "postgres",
    tableName: "etl_table_config",
  })

  const [queryData, setQueryData] = useState({
    layer: "all",
    tableName: "",
  })

  const handleDbSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Create a new pool instance

    toast({
      title: "Connection Successful",
      description: `Connected to ${dbData.database} on ${dbData.host}`,
    })
    setDbConfigured(true)
  }

const handleIdClick = (rowId: number) => {
  const confirmDelete = confirm(`Do you want to delete row ID #${rowId}?`);
  if (confirmDelete) {
    fetch(`/api/etl_config_table/${rowId}`, {
        method: 'DELETE',

        body: JSON.stringify({
          poolCredentials: {
            host: dbData.host,
            port: dbData.port,
            user: dbData.username,
            password: dbData.password,
            db: dbData.database,
            tableName: dbData.tableName,
          },
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`ETL Config ID #${rowId} deleted successfully.`);
            // Optionally, you can add logic to refresh the table or remove the row from the UI
            setResults(prev => prev.filter(item => item.id !== rowId));
        } else {
            alert(`Failed to delete ETL Config ID #${rowId}: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Error deleting ETL Config:', error);
        alert(`An error occurred while deleting ETL Config ID #${rowId}.`);
    })
    .finally(() => {
        // Any cleanup actions if necessary
        console.log('Delete request ran.');
    });
  }
}


  const handleRowClick = (rowId: number) => {
    console.log("Row clicked with ID:", rowId);
    setSelectedRowId(rowId)
    setIsDialogOpen(true)
    // Todo: Open a dialogue here.
  }

  const addInputRow = (type: "text" | "select" | "textarea") => {
    const newRow: InputRow = {
      id: Date.now().toString(),
      type,
      label: type === "text" ? "New Text Input" : type === "select" ? "New Select" : "New Textarea",
      value: "",
      options: type === "select" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    }
    setInputRows([...inputRows, newRow])
  }

  const removeInputRow = (id: string) => {
    setInputRows(inputRows.filter((row) => row.id !== id))
  }

  const updateInputRowValue = (id: string, value: string) => {
    setInputRows(inputRows.map((row) => (row.id === id ? { ...row, value } : row)))
  }

  const updateInputRowLabel = (id: string, label: string) => {
    setInputRows(inputRows.map((row) => (row.id === id ? { ...row, label } : row)))
  }

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsQuerying(true)

    try {
      // TODO: Implement actual DB query logic using your PostgreSQL configuration
      // This would typically involve a server action or API call to fetch data based on filters
      try {
        fetch("/api/etl_config_table", {
          method: "POST",
          body: JSON.stringify({
            poolCredentials: {
              host: dbData.host,
              port: dbData.port,
              user: dbData.username,
              password: dbData.password,
              db: dbData.database,
              tableName: dbData.tableName,
            },
            queryFilters: queryData,
          }),
        })
        .then((res) => res.json())
        .then((data) => {
          console.log("ETL Config Query Results:", data);
          if (data.success) {
            setResults(data.data);
          } else {
            toast({
              title: "Query Failed",
              description: data.error,
              variant: "destructive",
            })
          }
        });
      }
      catch (error) {
        console.error("Error querying ETL configs:", error);
      };

      // Mock data matching the schema from varchar.ts
      setResults([
        {
          id: 1,
          layer: "gold",
          source_table_name: "customer_data",
          source_table_full_name: "/data/source/customer_data.csv",
          target_table_full_name: "customer_data_gold",
          target_table_name: "customer_data_gold",
          target_table_ddl: "CREATE TABLE customer_data_gold (...)",
          enabled: true,
        }
      ])
      toast({
        title: "Query Complete",
        description: `Found records matching your criteria.`,
      })
    } catch (error: any) {
      toast({
        title: "Query Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsQuerying(false)
    }
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Explorer</h1>
            <p className="text-muted-foreground">Manage and query your ETL configurations</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-3 h-fit">
            <CardHeader>
              <CardTitle>PostgreSQL Config</CardTitle>
              <CardDescription>Database connection settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDbSubmit} className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={dbData.host}
                    onChange={(e) => setDbData({ ...dbData, host: e.target.value })}
                    placeholder="localhost"
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={dbData.port}
                      onChange={(e) => setDbData({ ...dbData, port: e.target.value })}
                      required
                      disabled={dbConfigured}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={dbData.username}
                      onChange={(e) => setDbData({ ...dbData, username: e.target.value })}
                      required
                      disabled={dbConfigured}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={dbData.password}
                    onChange={(e) => setDbData({ ...dbData, password: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    id="database"
                    value={dbData.database}
                    onChange={(e) => setDbData({ ...dbData, database: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tableName">Config Table</Label>
                  <Input
                    id="tableName"
                    value={dbData.tableName}
                    onChange={(e) => setDbData({ ...dbData, tableName: e.target.value })}
                    required
                    disabled={dbConfigured}
                  />
                </div>
                {!dbConfigured ? (
                  <Button type="submit" className="w-full">
                    Configure Database
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => setDbConfigured(false)}
                  >
                    Edit Connection
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-9 space-y-8">
            <Card className={!dbConfigured ? "opacity-50 pointer-events-none" : ""}>
              <CardHeader>
                <CardTitle>Query Filters</CardTitle>
                <CardDescription>Search for specific ETL configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuerySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="layer">Layer</Label>
                      <Select value={queryData.layer} onValueChange={(v) => setQueryData({ ...queryData, layer: v })}>
                        <SelectTrigger id="layer">
                          <SelectValue placeholder="Select layer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Layers</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="queryTable">Table Name</Label>
                      <Input
                        id="queryTable"
                        placeholder="Filter by name..."
                        value={queryData.tableName}
                        onChange={(e) => setQueryData({ ...queryData, tableName: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isQuerying}>
                    {isQuerying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Query...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Run Query
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          {results.length > 0 && (
              <Card className="animate-in fade-in slide-in-from-top-4 duration-500 col-span-12">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>ETL configurations matching your filters</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ETLConfigTable data={results} onIdClick={handleIdClick} onRowClick={handleRowClick} />
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Row Configuration {selectedRowId !== null && `(ID: ${selectedRowId})`}</DialogTitle>
            <DialogDescription>
              Customize your input fields below. Click the add buttons to create new rows.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-4">
            {inputRows.map((row) => (
              <Card key={row.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`label-${row.id}`} className="min-w-[80px]">
                        Label:
                      </Label>
                      <Input
                        id={`label-${row.id}`}
                        value={row.label}
                        onChange={(e) => updateInputRowLabel(row.id, e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`input-${row.id}`}>{row.label}</Label>
                      {row.type === "text" && (
                        <Input
                          id={`input-${row.id}`}
                          value={row.value}
                          onChange={(e) => updateInputRowValue(row.id, e.target.value)}
                          placeholder="Enter text..."
                        />
                      )}
                      {row.type === "select" && (
                        <Select value={row.value} onValueChange={(v) => updateInputRowValue(row.id, v)}>
                          <SelectTrigger id={`input-${row.id}`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {row.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {row.type === "textarea" && (
                        <Textarea
                          id={`input-${row.id}`}
                          value={row.value}
                          onChange={(e) => updateInputRowValue(row.id, e.target.value)}
                          placeholder="Enter multi-line text..."
                          rows={4}
                        />
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInputRow(row.id)}
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
                  console.log("Submitted values:", inputRows)
                  toast({
                    title: "Configuration Saved",
                    description: "Your row configuration has been saved successfully.",
                  })
                  setIsDialogOpen(false)
                }}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
