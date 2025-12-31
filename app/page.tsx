"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { AggregateMethod, ColumnRowData } from "@/types/ColumnRowData"
import { useUsername } from "@/context/usernameContext"
import { GenRequest } from "@/types/GenRequest"
import { GenResponse } from "@/types/GenResponse"
import validateColumnsConfig from "./helper/validateColumnsConfig"
import ColumnBuilder from "@/components/ColumnBuilder"
import { SchemaRegistry } from "@/components/SchemaRegistry"
import { DatabaseConfig } from "@/types/DatabaseConfig"
import PostgresConfig from "@/components/PostgresConfig"
import { GenericResponse } from "@/types/GenericResponse"
import { useColumnsConfig } from "@/hooks/useColumnConfigs"
import { PostgresContextProvider } from "@/context/postgresContext"
import { TableConfig, TableTypes } from "@/types/TableConfig"

export default function HomePage() {
	const { toast } = useToast()

	const [sqlContentGold, setSQLContentGold] = useState("");
	const [sqlContentSilver, setSQLContentSilver] = useState("");


	const [showColumnsConfig, setShowColumnsConfig] = useState(false);
	const [showPostgresForm, setShowPostgresForm] = useState(false);

	const username = useUsername();

	const [tableConfig, setTableConfig] = useState<TableConfig>({
		tableName: "",
		tableType: "dim",
	});
	const [isSubmittingColumns, setIsSubmittingColumns] = useState(false)

	const { columnsConfig, addColumn, removeColumn, updateColumn, resetColumns } = useColumnsConfig()

	const submitColumns = async (tableType: TableTypes) => {
		setIsSubmittingColumns(true)

		const { isInvalidExists, invalidConfigs } = validateColumnsConfig(columnsConfig)

		if (isInvalidExists) {
			toast({
				title: "Validation Error",
				description: `Please fill in all fields for rows ${invalidConfigs?.join(', ')}`,
				variant: "destructive",
			})
			setIsSubmittingColumns(false)
			return;
		}

		try {
			const requestBody: GenRequest = {
				columns: columnsConfig,
				tableName: tableConfig?.tableName!,
				tableType: tableType,
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
				description: `Submitted ${columnsConfig.length} column(s) configuration`,
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


	const submitConfig = async (postgresConfig: DatabaseConfig) => {
		try {
			const data = await fetch("/api/etl_config_table/submit", {
				method: "POST",
				body: JSON.stringify({
					poolCredentials: postgresConfig,
					sqlContentGold: sqlContentGold,
					sqlContentSilver: sqlContentSilver,
				}),
				headers: { "Content-Type": "application/json" },
			})
			const res: GenericResponse = await data.json();
			console.log(res);

			if (res.success) {
				toast({
					title: "Success",
					description: res.message ? res.message : "",
					variant: "default",
				})
			}

		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to process PostgreSQL configuration",
				variant: "destructive",
			})
			console.log("Error submitting ETL config:", error);
		}
	}

	return (
		<PostgresContextProvider>
			<main className="min-h-screen bg-background py-12 px-4">
				<div className="max-w-4xl mx-auto space-y-8">
					<div className="text-center space-y-2">
						<h1 className="text-4xl font-bold tracking-tight">ETL Table Create</h1>
						<p className="text-muted-foreground text-lg">Create Table for ETL Config</p>
					</div>

					<SchemaRegistry addColumn={addColumn} showColumnsConfig={showColumnsConfig} setShowColumnsConfig={setShowColumnsConfig} setTableConfig={setTableConfig} resetColumns={resetColumns} />

					{showColumnsConfig && (
						<ColumnBuilder
							addColumn={addColumn}
							columnsConfig={columnsConfig}
							submitColumns={submitColumns}
							isSubmittingColumns={isSubmittingColumns}
							removeColumn={removeColumn}
							updateColumn={updateColumn}
						/>)}

					{showPostgresForm && (<PostgresConfig submitConfig={submitConfig} isTableNameRequired={false} />)}
				</div>
			</main>
		</PostgresContextProvider>
	)
}
