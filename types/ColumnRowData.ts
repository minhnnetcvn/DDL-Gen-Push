export interface ColumnRowData {
	id: string;
	columnName: string;
	type: string;
	aggregateMethod: AggregateMethod;
}

export type AggregateMethod = 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN' | 'PK' | 'ANY_VALUE' | 'FIRST_VALUE' | 'LAST_VALUE' | 'NONE';