export interface SilverConfigParams {
  tableNameUpper: string;
  tableNameLower: string;
  ddl: string;
  pkColumn: string;
  schemaRegistryUrl: string;
  createdBy: string;
}

export interface GoldConfigParams {
  tableNameUpper: string;
  tableNameLower: string;
  goldDDL: string;
  transformSQL: string;
  createdBy: string;
}

export interface GoldDDLParams {
    dimensionColumns: string;
    aggregateColumns: string;
}

export interface SilverDDLParams {
    tableNameLower: any;
    tableNameUpper: string;
    ddlJoined: string;
}