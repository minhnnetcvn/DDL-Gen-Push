export interface ConfigParams {
  tableNameUpper: string;
  tableNameLower: string;
  ddl: string;
  pkColumns: string;
  transformSQL?: string;
  createdBy: string;
}

export interface DDLParams {
    dimensionDefinitions? : string;
    aggregateDefinitions? : string;
    allColumnsDefinitions? : string;
    tableName: string;
}

export interface TransformParams {
    dimensionColumns: string;
    aggregateColumns: string;
    allColumns?: string;
}