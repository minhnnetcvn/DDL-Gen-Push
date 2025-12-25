import { ColumnRowData } from "@/types/ColumnRowData";

interface invalidColumns {
    isInvalidExists: boolean;
    invalidConfigs?: string[];
}

export default function validateColumnsConfig(columns: ColumnRowData[]) : invalidColumns {
    const invalidConfigCount = columns.filter((column) => !column.columnName || !column.type || !column.aggregateMethod)
    
    return { 
        isInvalidExists : invalidConfigCount.length > 0,
        invalidConfigs: invalidConfigCount.map(column => column.columnName !== ""? column.columnName : "Empty Column")
    };
}