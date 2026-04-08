export const dynamic = "force-dynamic"
import HomeClient from "@/components/HomeClient"
import { DatabaseConfig } from "@/types/DatabaseConfig"

export default function Page() {
	const defaultKafkaIp = process.env.DEFAULT_IP_ADDRESS_SCHEMA_REGISTRY || "localhost"
	const defaultSchemaRegistryPort = process.env.DEFAULT_SCHEMA_REGISTRY_PORT || "8081"
	const TLSEnabled = process.env.TLS_ENABLED === "true"

	// const protocol = TLSEnabled ? "https" : "http"
	// const defaultIpWithProtocol = `${protocol}://${defaultKafkaIp}:${defaultSchemaRegistryPort}`

	const defaultConnectionString: DatabaseConfig = {
		host: process.env.DEFAULT_DB_HOST || "localhost",
		port: process.env.DEFAULT_DB_PORT || "5432",
		user: process.env.DEFAULT_DB_USER || "postgres",
		password: process.env.DEFAULT_DB_PASSWORD || "postgres",
		databaseName: process.env.DEFAULT_DB_NAME || "postgres"
	}

	
	console.log("ENV DB HOST:", process.env.DEFAULT_DB_HOST)
	console.log("ENV IP:", process.env.DEFAULT_IP_ADDRESS_KAFKA)

	return <HomeClient defaultKafkaIp={defaultKafkaIp} defaultConnectionString={defaultConnectionString} TLSEnabled={TLSEnabled} />
}