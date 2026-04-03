"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { type ETLConfig } from "@/components/ETLConfigTable"
import { Database } from "lucide-react"
import { ColumnType } from "@/types/ColumnType"
import PostgresConfig from "@/components/PostgresConfig"
import { DatabaseConfig } from "@/types/DatabaseConfig"
import { PostgresContextProvider } from "@/context/postgresContext"
import QueryBuilder, { QueryData } from "@/components/QueryBuilder"
import QueryResult from "@/components/QueryResult"
import ConfigDialogue from "@/components/ConfigDialogue"

interface Props {
	defaultConnectionString: DatabaseConfig
}	

export default function DBExplorerPage({defaultConnectionString}: Props) {
	const { toast } = useToast();
	const [isDbConfigured, setIsDbConfigured] = useState(false);
	const [isQuerying, setIsQuerying] = useState(false);
	const [queryResults, setResults] = useState<ETLConfig[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const [columnsConfig, setcolumnsConfig] = useState<ColumnType[]>([]);

	const updateQuery = async (rowId: number, postgresConfig: DatabaseConfig, queryData: ColumnType[]): Promise<boolean> => {
		const updatedRecord = queryData.reduce((acc, column) => {
			acc[column.key] = column.value;
			return acc;
		}, {} as Record<string, unknown>);

		try {
			const resp: Response = await fetch(`/api/etl_config_table/${rowId}`, {
				method: "PUT",
				body: JSON.stringify({
					poolCredentials: {
						host: postgresConfig.host,
						port: postgresConfig.port,
						user: postgresConfig.user,
						password: postgresConfig.password,
						db: postgresConfig.databaseName,
						tableName: postgresConfig.tableName,
					},
					updatedConfig: updatedRecord,
				}),
			});

			const data = await resp.json();
			if (data.success) {
				toast({
					title: "Update saved",
					description: `ETL config #${rowId} was updated.`,
				});
				setResults((prev) =>
					prev.map((item) =>
						item.id === rowId ? { ...item, ...updatedRecord } : item,
					),
				);
				return true;
			}
			toast({
				title: "Update failed",
				description: data.error ?? "Unknown error",
				variant: "destructive",
			});
			return false;
		} catch (error: unknown) {
			console.error("Error updating ETL Config:", error);
			toast({
				title: "Update failed",
				description:
					error instanceof Error ? error.message : "An unexpected error occurred.",
				variant: "destructive",
			});
			return false;
		}
	};

	const openDialog = (rowId: number) => {
		setIsDialogOpen(true)
		setcolumnsConfig(prev => prev = 
			Object.entries(queryResults.filter((row) => row.id === rowId)[0])
			.map(([key, value]) => {
				return {
					id: crypto.randomUUID(),
					key: key,
					value: String(value),
					dataType: value === "gold" || value === "silver" || value === "true" || value === "false" ? "select" : key.toLowerCase().includes("ddl") ? "textarea" : "text",
					options: key === "layer" ? ["gold", "silver"] : key === "enabled" ? ["true", "false"] : undefined,
				}
			})
		);
	}

	const submitQuery = async (postgresConfig: DatabaseConfig, queryData: QueryData) => {
		setIsQuerying(true);

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
						tableName: postgresConfig.tableName!,
					},
					queryFilters: queryData,
				}),
			});

			const data = await resp.json();
			if (process.env.NODE_ENV === "development") {
				console.log("ETL Config Query Results:", data);
			}
			if (data.success) {
				setResults(Array.isArray(data.data) ? data.data : []);

				const n = Array.isArray(data.data) ? data.data.length : 0;
				toast({
					title: "Query complete",
					description: n === 0 ? "No rows returned." : `Found ${n} row${n === 1 ? "" : "s"}.`,
				});
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
			toast({title: "Query Failed", description: error.message, variant: "destructive"})
		} finally { setIsQuerying(false) }
	}

	const deleteConfig = async (postgresConfig: DatabaseConfig, rowId: number) => {
		try {
			const Data = await fetch(`/api/etl_config_table/${rowId}`, {
				method: 'DELETE',

				body: JSON.stringify({
					poolCredentials: {
						host: postgresConfig.host,
						port: postgresConfig.port,
						user: postgresConfig.user,
						password: postgresConfig.password,
						db: postgresConfig.databaseName,
						tableName: postgresConfig.tableName,
					},
				}),
			});
			const response = await Data.json();
			if (response.success) {
				toast({
					title: "Deleted",
					description: `ETL config #${rowId} was removed.`,
				});
				setResults((prev) => prev.filter((item) => item.id !== rowId));
			} else {
				toast({
					title: "Delete failed",
					description: response.error ?? "Unknown error",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error deleting ETL Config:", error);
			toast({
				title: "Delete failed",
				description:
					error instanceof Error ? error.message : "An unexpected error occurred.",
				variant: "destructive",
			});
		}
	};


	return (
		<PostgresContextProvider defaultConnectionString={defaultConnectionString}>
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
								deleteConfig={deleteConfig}
								setcolumnsConfig={setcolumnsConfig}
								isDialogueOpen={isDialogOpen}
								openDialog={openDialog}
								setSelectedRowId={setSelectedRowId}
							/>
						)}
					</div>
				</div>

				<ConfigDialogue
					columnsConfig={columnsConfig}
					isDialogOpen={isDialogOpen}
					selectedRowId={selectedRowId}
					setIsDialogOpen={setIsDialogOpen}
					setcolumnsConfig={setcolumnsConfig}
					updateQuery={updateQuery}
				/>
				
			</main>
		</PostgresContextProvider>
	)
}
