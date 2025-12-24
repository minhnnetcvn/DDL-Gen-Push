export interface SchemaResponse {
    tableName: string;
    schema: Record<string, string>;
    registryUrl: string;
}