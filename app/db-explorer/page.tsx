"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ETLConfigTable, type ETLConfig } from "@/components/etl-config-table"
import { Database, Search, Loader2 } from "lucide-react"

export default function DBExplorerPage() {
  const { toast } = useToast()
  const [dbConfigured, setDbConfigured] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [results, setResults] = useState<ETLConfig[]>([])

  const [dbData, setDbData] = useState({
    host: "10.8.75.82",
    port: "5432",
    user: "postgres",
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
    // TODO: Implement actual connection validation logic here
    toast({
      title: "Connection Successful",
      description: `Connected to ${dbData.database} on ${dbData.host}`,
    })
    setDbConfigured(true)
  }

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsQuerying(true)

    try {
      // TODO: Implement actual DB query logic using your PostgreSQL configuration
      // This would typically involve a server action or API call to fetch data based on filters
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Mock data matching the schema from varchar.ts
      const mockResults: ETLConfig[] = [
        {
          id: 1,
          layer: "Gold",
          source_table_name: "raw_users",
          target_table_name: "dim_users",
          source_table_full_name: "raw.raw_users",
          target_table_full_name: "gold.dim_users",
          enabled: true,
          processing_mode: "batch",
          last_run_status: "SUCCESS",
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          layer: "Silver",
          source_table_name: "crm_leads",
          target_table_name: "stg_leads",
          source_table_full_name: "raw.crm_leads",
          target_table_full_name: "silver.stg_leads",
          enabled: true,
          processing_mode: "incremental",
          last_run_status: "FAILED",
          updated_at: new Date().toISOString(),
        },
      ]

      setResults(mockResults)
      toast({
        title: "Query Complete",
        description: `Found ${mockResults.length} records matching your criteria.`,
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
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>PostgreSQL Config</CardTitle>
              <CardDescription>Database connection settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDbSubmit} className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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

          <div className="lg:col-span-2 space-y-8">
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

            {results.length > 0 && (
              <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>ETL configurations matching your filters</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ETLConfigTable data={results} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
