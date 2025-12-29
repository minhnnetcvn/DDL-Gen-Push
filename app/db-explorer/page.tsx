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
import QueryResults from "@/components/QueryResult"
import QueryResult from "@/components/QueryResult"

export default function DBExplorerPage() {
	const { toast } = useToast();
	const [isDbConfigured, setIsDbConfigured] = useState(false);
	const [isQuerying, setIsQuerying] = useState(false);
	const [queryResults, setResults] = useState<ETLConfig[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const [columnsConfig, setcolumnsConfig] = useState<ColumnType[]>([]);

	const username = useUsername();

	const addInputRow = (type: "text" | "select" | "textarea") => {
		const newRow: ColumnType = {
			id: uuidv4(),
			key: "",
			value: "",
			dataType: type,
		}
		setcolumnsConfig([...columnsConfig, newRow])
	}

	const removeInputRow = (id: string) => {
		setcolumnsConfig(columnsConfig.filter((column) => column.id !== id))
	}

	const updateInputRowValue = (id: string, value: string) => {
		setcolumnsConfig(columnsConfig.map((column) => (column.id === id ? { ...column, value } : column)))
	}

	const updateInputRowKeyName = (id: string, newKeyName: string) => {
		setcolumnsConfig(columnsConfig.map((column) => (column.id === id ? { ...column, key: newKeyName } : column)))
	}

	const submitQuery = async (postgresConfig: DatabaseConfig, queryData: QueryData) => {
		setIsQuerying(true)

		try {
			const resp = await fetch("/api/etl_config_table", {
				method: "POST",
				body: JSON.stringify({
					poolCredentials: {
						host: postgresConfig.host,
						port: postgresConfig.port,
						user: postgresConfig.user,
						password: postgresConfig.password,
						db: postgresConfig.databaseName,
						tableName: postgresConfig.tableName,
					},
					queryFilters: queryData,
				}),
			});

			const data = await resp.json();
			console.log("ETL Config Query Results:", data);
			if (data.success) {
				setResults(data.data);

				toast({
					title: "Query Complete",
					description: `Found records matching your criteria.`,
				})
			}
			else {
				toast({
					title: "Query Failed",
					description: data.error,
					variant: "destructive",
				})
			}
		}
		catch (error: any) {
			toast({
				title: "Query Failed",
				description: error.message,
				variant: "destructive",
			})
		} finally {
			setIsQuerying(false)
		}
	}

	const updateQuery = async (rowId: number, postgresConfig: DatabaseConfig, queryData: ColumnType[]) => {
		try {
			const resp: Response = await fetch(`/api/etl_config_table/${selectedRowId}`, {
				method: 'PUT',
				body: JSON.stringify({
					poolCredentials: {
						host: postgresConfig.host,
						port: postgresConfig.port,
						user: postgresConfig.user,
						password: postgresConfig.password,
						db: postgresConfig.databaseName,
						tableName: postgresConfig.tableName,
					},
					updatedConfig: columnsConfig.reduce((acc, column) => {
						acc[column.key] = column.value;
						return acc;
					}, {} as Record<string, any>),
				})
			})

			const data = await resp.json();
			if (data.success) {
				alert(`ETL Config ID #${selectedRowId} updated successfully.`);
				// Optionally, you can add logic to refresh the table or update the row in the UI
				setResults(prev => prev.map(item => item.id === selectedRowId ? {
					...item, ...columnsConfig.reduce((acc, column) => {
						acc[column.key] = column.value;
						return acc;
					}, {} as Record<string, any>)
				} : item));
			} else {
				alert(`Failed to update ETL Config ID #${selectedRowId}: ${data.error}`);
			}
		}
		catch (error: any) {
			console.error('Error updating ETL Config:', error);
			alert(`An error occurred while updating ETL Config ID #${selectedRowId}.`);
		}
		finally {
			// Any cleanup actions if necessary
			console.log('Update request ran.');
		};
	}

	return (
		<PostgresContextProvider>
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
						<PostgresConfig
							// submitConfig={handleQuerySubmit}
							isTableNameRequired={true}
							setIsDbConfigured={setIsDbConfigured}
							isDbConfigured={isDbConfigured}
						/>

						<QueryBuilder
							isDbConfigured={isDbConfigured}
							isQuerying={isQuerying}
							submitQuery={submitQuery}
						/>
						{queryResults.length > 0 && (
							<QueryResult 
								queryResults={queryResults}
								setResults={setResults}
								setcolumnsConfig={setcolumnsConfig}
							/>
						)}
					</div>
				</div>

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent className="w-[90vw] h-[90vh] overflow-hidden flex flex-col max-w-none max-h-none">
						<DialogHeader>
							<DialogTitle>Edit Row Configuration {selectedRowId !== null && `(ID: ${selectedRowId})`}</DialogTitle>
							<DialogDescription>
								Customize your input fields below. Click the add buttons to create new rows.
							</DialogDescription>
						</DialogHeader>

						<div className="flex-1 overflow-y-auto space-y-4 pr-4">
							{columnsConfig.map((column) => (
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
			</main>
		</PostgresContextProvider>
	)
}
