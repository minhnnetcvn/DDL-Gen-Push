export interface TableConfig {
    tableName: string,
    tableType: TableTypes,
}

export type TableTypes = "fact" | "dim";