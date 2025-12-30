import { Dispatch, SetStateAction, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ETLConfigTable, type ETLConfig } from "@/components/ETLConfigTable"
import { ColumnType } from "@/types/ColumnType"
import { DatabaseConfig } from "@/types/DatabaseConfig"
import { usePostgresConfig } from "@/context/postgresContext"

interface QueryResultProps {
	queryResults: ETLConfig[];
	isDialogueOpen: boolean;

	setcolumnsConfig: Dispatch<SetStateAction<ColumnType[]>>;
	setSelectedRowId: Dispatch<SetStateAction<number|null>>;
	openDialog: (rowId: number) => void;
	deleteConfig: (postgresConfig: DatabaseConfig, rowId: number) => void;
}


export default function QueryResults(props: QueryResultProps) {
	const {databaseConfig} = usePostgresConfig();
	const [deleteRowId, setDeleteRowId] = useState<number | null>(null);


	const handleIdClick = (rowId: number) => {
		setDeleteRowId(prev => prev = rowId);
		const confirmDelete = confirm(`Do you want to delete row ID #${rowId}?`);
		
		if (confirmDelete) {
			props.deleteConfig(databaseConfig, rowId)
		}
		setDeleteRowId(prev => prev = null);
	}

	const handleRowClick = (rowId: number) => {
		console.log("Row clicked with ID:", rowId);
		props.setSelectedRowId(rowId)
		props.openDialog(rowId);
	}


	return (
		<Card className="animate-in fade-in slide-in-from-top-4 duration-500 col-span-full">
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