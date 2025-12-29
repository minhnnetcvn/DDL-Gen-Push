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
import { ETLConfigRow } from "@/types/ETLConfigRow"

interface QueryResultProps {
	queryResults: ETLConfig[];
	setResults: Dispatch<SetStateAction<ETLConfig[]>>;
	setcolumnsConfig: Dispatch<SetStateAction<ColumnType[]>>;
}


export default function QueryResults(props: QueryResultProps) {
	const { databaseConfig, setDatabaseConfig } = usePostgresConfig();
	const [deleteRowId, setDeleteRowId] = useState<number | null>(null);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleIdClick = async (rowId: number) => {
		setDeleteRowId(rowId);
		const confirmDelete = confirm(`Do you want to delete row ID #${rowId}?`);
		if (confirmDelete) {
			try {
				const Data = await fetch(`/api/etl_config_table/${rowId}`, {
					method: 'DELETE',

					body: JSON.stringify({
						poolCredentials: {
							host: databaseConfig.host,
							port: databaseConfig.port,
							user: databaseConfig.user,
							password: databaseConfig.password,
							db: databaseConfig.databaseName,
							tableName: databaseConfig.tableName,
						},
					}),
				});
				const response = await Data.json();
				if (response.success) {
					console.log(response);
					alert(`ETL Config ID #${rowId} deleted successfully.`);
					// Optionally, you can add logic to refresh the table or remove the row from the UI
					props.setResults(prev => prev.filter(item => item.id !== rowId));
				}
				else {
					alert(`Failed to delete ETL Config ID #${rowId}: ${response.error}`);
				}

			} catch (error) {
				console.error('Error deleting ETL Config:', error);
				alert(`An error occurred while deleting ETL Config ID #${rowId}.`);
			} finally {
				// Any cleanup actions if necessary
				console.log('Delete request ran.');
				setDeleteRowId(prev => prev = null);
			};
		}
	}

	const handleRowClick = (rowId: number) => {
		console.log("Row clicked with ID:", rowId);
		setSelectedRowId(rowId)
		setIsDialogOpen(true)
		setcolumnsConfig(prev => prev = Object.entries(queryResults.filter((row) => row.id === rowId)[0])
			.map(([key, value]) => {
				return {
					id: uuidv4(),
					key: key,
					value: String(value),
					dataType: value === "gold" || value === "silver" || value === "true" || value === "false" ? "select" : key.toLowerCase().includes("ddl") ? "textarea" : "text",
					options: key === "layer" ? ["gold", "silver"] : key === "enabled" ? ["true", "false"] : undefined,
				}
			})
		);


		console.log("Loaded columns config:", columnsConfig);
	}


	return (
		<Card className="animate-in fade-in slide-in-from-top-4 duration-500 col-span-12">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Results</CardTitle>
					<CardDescription>ETL configurations matching your filters</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<ETLConfigTable data={props.queryResults} onIdClick={handleIdClick} onRowClick={handleRowClick} />
			</CardContent>
		</Card>
	)
}