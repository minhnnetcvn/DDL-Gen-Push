export const dynamic = "force-dynamic"
import DBExplorerClient from "./DBExplorerClient"
import { DatabaseConfig } from "@/types/DatabaseConfig"

export default function Page() {
  const defaultConnectionString: DatabaseConfig = {
    host: process.env.DEFAULT_DB_HOST || "localhost",
    port: process.env.DEFAULT_DB_PORT || "5432",
    user: process.env.DEFAULT_DB_USER || "postgres",
    password: process.env.DEFAULT_DB_PASSWORD || "postgres",
    databaseName: process.env.DEFAULT_DB_NAME || "postgres"
  }
  
  return <DBExplorerClient defaultConnectionString={defaultConnectionString} />
}