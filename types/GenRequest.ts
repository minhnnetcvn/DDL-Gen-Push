import { ColumnRowData } from "./ColumnRowData";
import { TableTypes } from "./TableConfig";

export interface GenRequest {
    tableName: string;
    tableType: TableTypes
    columns: ColumnRowData[];
    author: string;
}

