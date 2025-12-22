"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ColumnRow, type ColumnRowData } from "@/components/column-row"
import { SchemaMap } from "@/types/SchemaMap"
import validateField from "./helper/validateField"

export default function HomePage() {
  const { toast } = useToast()

  const [goldDDL, setGoldDDL] = useState("")
  const [sqlContentGold, setSQLContentGold] = useState("")
  const [sqlContentSilver, setSQLContentSilver] = useState("")

  const [showColumnForm, setShowColumnForm] = useState(false)
  const [showPostgresForm, setShowPostgresForm] = useState(false)
  const [schemaData, setSchemaData] = useState({
    schemaRegistryUrl: "",
    tableName: "",
    option: "",
  })

  const [postgresData, setPostgresData] = useState({
    host: "10.8.75.82",
    port: "5432",
    user: "postgres",
    password: "postgres",
    databaseName: "postgres",
  })
  const [isSubmittingPostgres, setIsSubmittingPostgres] = useState(false)

  const [formData, setFormData] = useState({
    schemaRegistryUrl: "10.8.75.82:8081",
    tableName: "",
    option: "",
  })
  const [errors, setErrors] = useState({
    schemaRegistryUrl: "",
    tableName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [rows, setRows] = useState<ColumnRowData[]>([])
  const [isSubmittingColumns, setIsSubmittingColumns] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

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

  const addRow = (aColumnName="", aType="", aAggregateMethod="") => {
    setRows(prevRows => [...prevRows, { id: crypto.randomUUID(), columnName: aColumnName, type: aType, aggregateMethod: aAggregateMethod }])
  }

  const handleSchemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = {
      schemaRegistryUrl: validateField("schemaRegistryUrl", formData.schemaRegistryUrl),
      tableName: validateField("tableName", formData.tableName),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error !== "")) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      fetch("/api/gen", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      })
      .then(res => res.json())
      .then(data => {
        // console.log("Received data:", data);

        data = typeof data === "string" ? JSON.parse(data) : data // Handle stringified JSON;

        if(data.sqlContentGold) {
          const sqlContentGold = data.sqlContentGold;
          setSQLContentGold(sqlContentGold);
          // console.log("Gold SQL Content:", sqlContentGold);
        }

        if(data.sqlContentSilver) {
          const sqlContentSilver = data.sqlContentSilver;
          setSQLContentSilver(sqlContentSilver);
          // console.log("Silver SQL Content:", sqlContentSilver);
        }
        
        if (data.schema) {
          const goldDDL = data.goldSql;
          setGoldDDL(goldDDL);
          // console.log("Gold DDL:", goldDDL);
          const schema : SchemaMap = data.schema;
          // console.log(schema);

          Object.entries(schema).forEach(([columnName, columnType], idx) => {
            addRow(columnName, columnType, "NONE");
            // Add row
          });
        }
      })
      .finally(() => {
        console.log("Fetch operation completed.");
        console.log(rows);
      }); 
      toast({
        title: "Success",
        description: "Schema registry data processed successfully!",
      })

      setSchemaData(formData)
      setShowColumnForm(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to process schema registry data",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one row is required",
        variant: "destructive",
      })
      return
    }
    setRows(prev => rows.filter((row) => row.id !== id))
  }

  const updateRow = (id: string, field: keyof Omit<ColumnRowData, "id">, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const handleColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingColumns(true)

    const invalidRows = rows.filter((row) => !row.columnName || !row.type || !row.aggregateMethod)

    if (invalidRows.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields for each row",
        variant: "destructive",
      })
      setIsSubmittingColumns(false)
      return
    }

    try {
      fetch("/api/gen_gold", {
        method: "POST",
        body: JSON.stringify({
          sqlContentGold: sqlContentGold,
          goldDDL: goldDDL,
          columns: rows.map((row) => ({
            name: row.columnName,
            type: row.type,
            aggregate: row.aggregateMethod == "NONE" ? "" : row.aggregateMethod,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      })
      .then(res => res.json())
      .then(data => {
        setSQLContentGold(data.sqlContentGold);
        // console.log(data);
      });

      toast({
        title: "Success!",
        description: `Submitted ${rows.length} column(s) configuration`,
      })

      setShowPostgresForm(prev => true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to process column configuration data",
        variant: "destructive",
      })
      console.log(error);
    } finally {
      setIsSubmittingColumns(false)
    }
  }

  const handlePostgresSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPostgres(true)

    try {
      // Connect DB and submit ETL config
      try {
        fetch("/api/submit_etl_config", {
          method: "POST",
          body: JSON.stringify({
            poolCredentials: postgresData,
            sqlContentGold: sqlContentGold,
            sqlContentSilver: sqlContentSilver,
          }),
          headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json())
        .then(data => {
          toast({
            title: "Success",
            description: "PostgreSQL configuration submitted successfully!",
          })
        });
      } catch (error) {
        console.log("Error submitting ETL config:", error);
      }

      console.log("PostgreSQL data:", postgresData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process PostgreSQL configuration",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPostgres(false)
    }
  }


  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">ETL Table Create</h1>
          <p className="text-muted-foreground text-lg">Create Table for ETL Config</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schema Registry</CardTitle>
            <CardDescription>Configure schema registry with URL, table name, and option validation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchemaSubmit} className="space-y-6">
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
                  disabled={showColumnForm}
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
                  disabled={showColumnForm}
                />
                {errors.tableName && <p className="text-sm text-destructive">{errors.tableName}</p>}
              </div>

              <div className="space-y-3">
                <Label>Option</Label>
                <RadioGroup value={formData.option} onValueChange={handleOptionChange} disabled={showColumnForm}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="both" disabled={showColumnForm} />
                    <Label htmlFor="both" className="font-normal cursor-pointer">
                      Both
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="goldonly" id="goldonly" disabled={true} />
                    <Label htmlFor="goldonly" className="font-normal cursor-pointer">
                      Gold only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="silveronly" id="silveronly" disabled={true} />
                    <Label htmlFor="silveronly" className="font-normal cursor-pointer">
                      Silver only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {!showColumnForm && (
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {showColumnForm && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Column Configuration</CardTitle>
              <CardDescription>Define columns with their names, data types, and aggregate methods</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleColumnSubmit} className="space-y-6">
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
                        {rows.map((row) => (
                          <ColumnRow
                            key={row.id}
                            row={row}
                            onUpdate={updateRow}
                            onRemove={removeRow}
                            canRemove={rows.length > 1}
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
        )}

        {showPostgresForm && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>PostgreSQL Configuration</CardTitle>
              <CardDescription>Enter connection details for your PostgreSQL database</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostgresSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      placeholder="localhost or 192.168.1.1"
                      value={postgresData.host}
                      onChange={(e) => setPostgresData({ ...postgresData, host: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      placeholder="5432"
                      value={postgresData.port}
                      onChange={(e) => setPostgresData({ ...postgresData, port: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Input
                      id="user"
                      placeholder="postgres"
                      value={postgresData.user}
                      onChange={(e) => setPostgresData({ ...postgresData, user: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={postgresData.password}
                      onChange={(e) => setPostgresData({ ...postgresData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label htmlFor="databaseName">Database Name</Label>
                    <Input
                      id="databaseName"
                      placeholder="my_database"
                      value={postgresData.databaseName}
                      onChange={(e) => setPostgresData({ ...postgresData, databaseName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmittingPostgres}>
                  {isSubmittingPostgres ? "Connecting..." : "Submitting ETL Config"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
