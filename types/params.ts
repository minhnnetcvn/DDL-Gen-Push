import { TableTypes } from "./TableConfig";

export interface ConfigParams {
  tableNameUpper: string;
  tableNameLower: string;
  ddl: string;
  pkColumns: string;
  transformSQL?: string;
  createdBy: string;
  tableType: TableTypes
}

export interface DDLParams {
    dimensionDefinitions? : string;
    aggregateDefinitions? : string;
    allColumnsDefinitions? : string;
    tableName: string;
    tableType: TableTypes
}

export interface TransformParams {
    dimensionColumns: string;
    aggregateColumns: string;
    allColumns?: string;
    tableNameLower: string
    tableType: TableTypes
}