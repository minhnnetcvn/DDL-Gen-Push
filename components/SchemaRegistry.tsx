import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/useToast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

import validateField from "@/app/helper/validateField";

import { SchemaMap } from "@/types/PrimitiveTypes";
import { SchemaConfig, SchemaResponse } from "@/types/SchemaResponse";
import { useState, Dispatch, SetStateAction } from "react";
import { AggregateMethod } from "@/types/ColumnRowData";
import { TableConfig } from "@/types/TableConfig";

interface SchemaRegistryProp {
	addColumn: (aColumnName: string, aType: string, aAggregateMethod: AggregateMethod) => void;
	resetColumns: () => void;
	showColumnsConfig: boolean;
	setShowColumnsConfig: Dispatch<SetStateAction<boolean>>;
	setTableConfig: Dispatch<SetStateAction<TableConfig>>;
}

export function SchemaRegistry(props: SchemaRegistryProp) {
	const [formData, setFormData] = useState({
		schemaRegistryUrl: "10.8.75.82:8081",
		tableName: "",
		option: "",
		createdBy: ""
	})

	const [errors, setErrors] = useState({
		schemaRegistryUrl: "",
		tableName: "",
	})

	const [isSubmitting, setIsSubmitting] = useState(false)

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
			});

			return;
		}

		setIsSubmitting(true)

		try {
			const data = await fetch("/api/schema", {
				method: "POST",
				body: JSON.stringify(formData),
				headers: { "Content-Type": "application/json" },
			})

			props.resetColumns();

			const schemaResponse: SchemaResponse = await data.json();
			console.log(schemaResponse);

			if (schemaResponse.schemaMap) {
				const schemaConfig: SchemaConfig[] = schemaResponse.schemaMap;

				schemaConfig.forEach((config, idx) => {
					props.addColumn(config.name, config.type, "LAST_VALUE"); // Add Row for each schema entry
				});

				props.setShowColumnsConfig(true);

				toast({
					title: "Success",
					description: "Schema registry data processed!",
				})
			}
			else {
				alert("Error 204. No schema data received from server.");

				toast({
					title: "Error",
					description: "No schema matches",
					variant: "destructive",
				})
			}

			schemaResponse.registryUrl && setFormData((prev) => ({ ...prev, registryUrl: schemaResponse.registryUrl }));
			schemaResponse.tableName && setFormData((prev) => ({ ...prev, tableName: schemaResponse.tableName }));
			props.setTableConfig(prev => {
				return {
					...prev,
					tableName: schemaResponse.tableName
				}
			})
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


	return (
		<Card>
			<CardHeader>
				<CardTitle>Get Schema Registry</CardTitle>
				<CardDescription>Configure schema registry with URL, table name, and option validation</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSchemaSubmit} onReset={() => props.setShowColumnsConfig(prev => prev = false)} className="space-y-6">
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
							disabled={props.showColumnsConfig}
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
							disabled={props.showColumnsConfig}
						/>
						{errors.tableName && <p className="text-sm text-destructive">{errors.tableName}</p>}
					</div>

					<div className="space-y-3">
						<Label>Option</Label>
						<RadioGroup value={formData.option} disabled={props.showColumnsConfig}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="" id="both" disabled={props.showColumnsConfig} />
								<Label htmlFor="both" className="font-normal cursor-pointer">
									Both
								</Label>
							</div>
						</RadioGroup>
					</div>

					{!props.showColumnsConfig ? (<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>) :
						(<Button type="reset" className="w-full">
							Edit
						</Button>)
					}
				</form>
			</CardContent>
		</Card>
	)
}