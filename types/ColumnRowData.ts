export interface ColumnRowData {
	id: string;
	columnName: string;
	type: string;
	aggregateMethod: AggregateMethod;
	isPrimaryKey?: boolean; // Temporary optional, compulsory in future
}

export type AggregateMethod = 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN' | 'NONE' | 'ANY_VALUE' | 'FIRST_VALUE' | 'LAST_VALUE' | '';