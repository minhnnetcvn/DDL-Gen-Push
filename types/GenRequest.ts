import { ColumnRowData } from "./ColumnRowData";

export interface GenRequest {
    tableName: string;
    columns: ColumnRowData[];
    author: string;
}

