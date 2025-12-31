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
    dimensionColumnTransform? : string;
    goldColumnTransform? : string;
    allColumnsDefinitions? : string;
    tableName: string;
    tableType: TableTypes
}

export interface TransformParams {
    dimensionColumnTransform: string;
    goldColumnTransform: string;
    allColumns?: string;
    tableNameLower: string
    tableType: TableTypes
}