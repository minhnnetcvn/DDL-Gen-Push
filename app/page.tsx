"use client"

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
import { AggregateMethod, ColumnRowData } from "@/types/ColumnRowData"
import { SchemaMap } from "@/types/PrimitiveTypes"
import validateField from "./helper/validateField"
import { v4 as uuidv4 } from 'uuid';
import { useUsername } from "@/context/username-context"
import { SchemaResponse } from "@/types/SchemaResponse"
import { GenRequest } from "@/types/GenRequest"
import { GenResponse } from "@/types/GenResponse"
import validateColumnsConfig from "./helper/validateColumnsConfig"
import ColumnBuilder from "@/components/ColumnBuilder"

export default function HomePage() {
  const { toast } = useToast()

  const [sqlContentGold, setSQLContentGold] = useState("")
  const [sqlContentSilver, setSQLContentSilver] = useState("")

  const [showColumnForm, setShowColumnForm] = useState(false)
  const [showPostgresForm, setShowPostgresForm] = useState(false)

  const username = useUsername();

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
    createdBy: ""
  })

  useEffect(() => {
    setFormData((prev) => ({...prev, createdBy: username}));
  }, [username]);

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const addRow = (aColumnName: string="", aType: string="", aAggregateMethod : AggregateMethod="") => {
    setRows(prevRows => [...prevRows, { id: uuidv4() /*crypto.randomUUID()*/, columnName: aColumnName, type: aType, aggregateMethod: aAggregateMethod }])
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
      fetch("/api/schema", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      })
      .then(res => res.json())
      .then(data => {

        const schemaResponse : SchemaResponse = data;
        console.log(schemaResponse);
        
        if (schemaResponse.schema) {
          const schema : SchemaMap = schemaResponse.schema;

          Object.entries(schema).forEach(([columnName, columnType], idx) => {
            addRow(columnName, columnType, "NONE"); // Add Row for each schema entry
          });
          
        }
        else {
          alert("Error 204. No schema data received from server.");
        }

        // Update registryUrl & table name in form data
        schemaResponse.registryUrl && setFormData((prev) => ({...prev, registryUrl: schemaResponse.registryUrl}));
        schemaResponse.tableName && setFormData((prev) => ({...prev, tableName: schemaResponse.tableName}));
        
      })
      .finally(() => {
        console.log("Fetch operation completed.");
      }); 
      toast({
        title: "Success",
        description: "Schema registry data processed successfully!",
      })

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

  const handleColumnsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingColumns(true)

    const {isInvalidExists, invalidConfigs} = validateColumnsConfig(rows)

    if (isInvalidExists) {
      toast({
        title: "Validation Error",
        description: `Please fill in all fields for rows ${invalidConfigs?.join(', ')}`,
        variant: "destructive",
      })
      setIsSubmittingColumns(false)
      return
    }

    try {
      const requestBody : GenRequest = {
          columns: rows,
          tableName: formData.tableName,
          author: username,
      }

      console.log(requestBody.columns);

      const data = await fetch('api/gen', {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
      });
      const result: GenResponse = await data.json();
      setSQLContentSilver(result.silverConfigQuery!);
      setSQLContentGold(result.goldConfigQuery!);
      console.log(result);


      toast({
        title: "Success!",
        description: `Submitted ${rows.length} column(s) configuration`,
      })

      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to process column configuration data",
        variant: "destructive",
      })
      console.log(error);
    } finally {
      setIsSubmittingColumns(false);
      setShowPostgresForm(prev => true);
    }
  }

  const handlePostgresSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPostgres(true)

    try {
      // Connect DB and submit ETL config
      console.log(sqlContentGold);
      console.log(sqlContentSilver);
      const data = await fetch("/api/etl_config_table/submit", {
        method: "POST",
        body: JSON.stringify({
          poolCredentials: postgresData,
          sqlContentGold: sqlContentGold,
          sqlContentSilver: sqlContentSilver,
        }),
        headers: { "Content-Type": "application/json" },
      })
      const res = await data.json();
      console.log(res);
      
      console.log("PostgreSQL data:", postgresData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process PostgreSQL configuration",
        variant: "destructive",
      })
      console.log("Error submitting ETL config:", error);
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
                <RadioGroup value={formData.option} disabled={showColumnForm}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="both" disabled={showColumnForm} />
                    <Label htmlFor="both" className="font-normal cursor-pointer">
                      Both
                    </Label>
                  </div>
                  {/* <div className="flex items-center space-x-2">
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
                  </div> */}
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
          <ColumnBuilder
            addRow={addRow} 
            columnsConfig={rows}
            handleColumnsSubmit={handleColumnsSubmit}
            isSubmittingColumns={isSubmittingColumns}
            removeRow={removeRow}
            updateRow={updateRow} 
          />
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
