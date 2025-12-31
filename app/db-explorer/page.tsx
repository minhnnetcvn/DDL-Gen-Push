"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { type ETLConfig } from "@/components/ETLConfigTable"
import { Database } from "lucide-react"
import { ColumnType } from "@/types/ColumnType"
import { useUsername } from "@/context/usernameContext"
import PostgresConfig from "@/components/PostgresConfig"
import { DatabaseConfig } from "@/types/DatabaseConfig"
import { PostgresContextProvider } from "@/context/postgresContext"
import QueryBuilder, { QueryData } from "@/components/QueryBuilder"
import QueryResult from "@/components/QueryResult"
import ConfigDialogue from "@/components/ConfigDialogue"

export default function DBExplorerPage() {
	const { toast } = useToast();
	const [isDbConfigured, setIsDbConfigured] = useState(false);
	const [isQuerying, setIsQuerying] = useState(false);
	const [queryResults, setResults] = useState<ETLConfig[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const [columnsConfig, setcolumnsConfig] = useState<ColumnType[]>([]);

	const username = useUsername();

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
			console.log("ETL Config Query Results:", data);
			if (data.success) {
				setResults(prev => prev = data.data);

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
				console.log(response);
				alert(`ETL Config ID #${rowId} deleted successfully.`);

				setResults(prev => prev.filter(item => item.id !== rowId));
			}
			else {
				alert(`Failed to delete ETL Config ID #${rowId}: ${response.error}`);
			}

		} catch (error) {
			console.error('Error deleting ETL Config:', error);
			alert(`An error occurred while deleting ETL Config ID #${rowId}.`);
		} finally {
			console.log('Delete request ran.');
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
					selectedRowId={selectedRowId!}
					setIsDialogOpen={setIsDialogOpen}
					setcolumnsConfig={setcolumnsConfig}
					updateQuery={updateQuery}
				/>
				
			</main>
		</PostgresContextProvider>
	)
}
