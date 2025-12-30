export interface DatabaseConfig {
  host: string;
  port: number | string;
  user: string;
  password: string;
  databaseName: string;
  tableName?: string;
}
