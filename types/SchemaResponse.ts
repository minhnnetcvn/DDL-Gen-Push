export interface SchemaResponse {
    tableName: string;
    schemaMap: SchemaConfig[];
    registryUrl: string;
}

export interface SchemaConfig {
    name: string;
    type: string;
}