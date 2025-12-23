export type ColumnType = {
    id: string;
    key: string;
    value: string;
    dataType: "text" | "select" | "textarea";
    options?: string[];
}