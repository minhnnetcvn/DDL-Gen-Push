import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { Dispatch, SetStateAction, useState } from "react";
import { DatabaseConfig } from "@/types/DatabaseConfig";
import { usePostgresConfig } from "@/context/postgresContext";

interface PostgresFormProps {
	isTableNameRequired: boolean;
	isDbConfigured?: boolean
	submitConfig?: (postgresConfig: DatabaseConfig) => void;
	setIsDbConfigured?: Dispatch<SetStateAction<boolean>>;

}

export default function PostgresConfig(props: PostgresFormProps) {
	const { databaseConfig, setDatabaseConfig } = usePostgresConfig();

	console.log()

	const [isSubmittingPostgres, setIsSubmittingPostgres] = useState(false)

	const handlePostgresSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmittingPostgres(true);

		try {
			props.submitConfig?.(databaseConfig);
			props.setIsDbConfigured?.(true);
		} catch (error) {
			console.log(error);
		} finally {
			setIsSubmittingPostgres(false);
		}
	};


	return (
		<Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 col-span-1">
			<CardHeader>
				<CardTitle>PostgreSQL Configuration</CardTitle>
				<CardDescription>Enter connection details for your PostgreSQL database</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handlePostgresSubmit} onReset={() => { if (props.setIsDbConfigured) props.setIsDbConfigured(false) }} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="host">Host</Label>
							<Input
								id="host"
								placeholder="localhost or 192.168.1.1"
								value={databaseConfig.host}
								onChange={(e) =>
									setDatabaseConfig(prev => ({
										...prev,
										host: e.target.value
									}))
								}
								required
								disabled={props.isDbConfigured}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="port">Port</Label>
							<Input
								id="port"
								placeholder="5432"
								value={databaseConfig.port}
								onChange={(e) => setDatabaseConfig(prev => ({ ...prev, port: e.target.value }))}
								required
								disabled={props.isDbConfigured}
							/>
						</div>
						<div className="space-y-2 col-span-full">
							<Label htmlFor="user">User</Label>
							<Input
								id="user"
								placeholder="postgres"
								value={databaseConfig.user}
								onChange={(e) => setDatabaseConfig(prev => ({ ...prev, user: e.target.value }))}
								required
								disabled={props.isDbConfigured}
							/>
						</div>
						<div className="space-y-2 col-span-full">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={databaseConfig.password}
								onChange={(e) => setDatabaseConfig(prev => ({ ...prev, password: e.target.value }))}
								required
								disabled={props.isDbConfigured}
							/>
						</div>
						<div className="col-span-full space-y-2">
							<Label htmlFor="databaseName">Database Name</Label>
							<Input
								id="databaseName"
								placeholder="my_database"
								value={databaseConfig.databaseName}
								onChange={(e) => setDatabaseConfig(prev => ({ ...prev, databaseName: e.target.value }))}
								required
								disabled={props.isDbConfigured}
							/>
						</div>
						{props.isTableNameRequired && (
							<div className="col-span-full space-y-2">
								<Label htmlFor="tableName">Config Table</Label>
								<Input
									id="tableName"
									value={databaseConfig.tableName}
									onChange={(e) => setDatabaseConfig(prev => ({ ...prev, tableName: e.target.value }))}
									required
									disabled={props.isDbConfigured}
								/>
							</div>
						)}
					</div>
					{!props.isDbConfigured ? (
						<Button
							type="submit"
							className="w-full"
						>
							Configure Database
						</Button>
					) : (
						<Button
							type="reset"
							variant="outline"
							className="w-full bg-transparent"
						>
							Edit Connection
						</Button>
					)}
				</form>
			</CardContent>
		</Card>
	)
}