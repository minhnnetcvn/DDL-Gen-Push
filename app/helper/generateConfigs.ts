import { ConfigParams, DDLParams, TransformParams } from "@/types/Params";
import datetimeNow from "./timeGenerator";
import { ColumnsClassificationType } from "@/types/ColumnsClassificationType";
import { ColumnRowData } from "@/types/ColumnRowData";
import { SQLQuery } from "@/types/PrimitiveTypes";

function buildAggregateTransform(agg: string, columnName: string): string {
	return `${agg}(${columnName}) AS ${columnName}`
}

export function generateColumnSQL(columns: ColumnRowData[]): ColumnsClassificationType {
	const goldColumnTransform: string[] = [];
	const dimensionColumnTransform: string[] = [];
    const allColumnsDefinitions: string[] = [];


	for (const col of columns) {
		if (col.aggregateMethod === "NONE") {
			dimensionColumnTransform.push(col.columnName);
            goldColumnTransform.push(col.columnName)
		} else goldColumnTransform.push(buildAggregateTransform(col.aggregateMethod, col.columnName));

        allColumnsDefinitions.push(`${col.columnName} ${col.type}`)
	}

	return {
		goldColumnTransform: goldColumnTransform.join(',\n      '),
        dimensionColumnTransform: dimensionColumnTransform.join(',\n      '),
        allColumnsDefinitions: allColumnsDefinitions.join(',\n      '),
	}
}

export function goldDDL(params: DDLParams): SQLQuery {
	const DDL = `CREATE TABLE IF NOT EXISTS ice.gold.${params.tableType == "dim" ? "dim_" : "fact_"}${params.tableName} (
        ${params.allColumnsDefinitions != ""? `${params.allColumnsDefinitions},`: ""}

		${params.tableType == "dim" ? `
                    scd_valid_from TIMESTAMP,
                    scd_valid_to TIMESTAMP,
                    is_active BOOLEAN,
                    processing_timestamp TIMESTAMP
          `: `
                    year  STRING,
                    month STRING,
                    day   STRING,
                    hour  STRING
		`}
        )
        USING iceberg
        ${params.tableType == "fact" ? 'PARTITIONED BY (year, month, day, hour)' : ""}
        TBLPROPERTIES (
        ''write.parquet.compression-codec''=''snappy'',
        ''write.target-file-size-bytes''=''268435456''
        )
    `;
	return DDL;
}

export function buildAggregateColumnName(agg: string, columnName: string): string {
	return `${columnName}`
}

export function transformSQLContent(params: TransformParams): SQLQuery {
	const transformSqlTemplate = `SELECT 
            ${params.goldColumnTransform != ""? `${params.goldColumnTransform},`: ""}
            

            ${params.tableType == "fact" ? `
                    year,
                    month,
                    day,
                    hour
            `: `
                NULL scd_valid_from,
                NULL scd_valid_to,
                1 is_active,
                NULL processing_timestamp
            `}
            
          FROM ice.silver.${params.tableNameLower}
          ${params.tableType == "fact" ? `WHERE year = ''\${year}'' 
                    AND month = ''\${month}'' 
                    AND day = ''\${day}''
                    AND hour = ''\${hour}''
          `: ''}
          GROUP BY 
              ${params.dimensionColumnTransform}
              ${params.tableType == "fact"? `,
                    year,
                    month,
                    day,
                    hour`: ""}
      `;
	return transformSqlTemplate.trim();
}

export function goldConfig(params: ConfigParams): SQLQuery {
	const goldConfigTemplate = `INSERT INTO etl_table_config (
            layer,
            source_table_name,
            target_table_name,
            source_table_full_name,
            target_table_full_name,
            target_table_ddl,
            target_partition_spec,
            primary_key_columns,
            transform_sql,
            enabled,
            batch_size,
            processing_interval_minutes,
            processing_mode,
            depends_on_tables,
            description,
            tags,
            created_by
        ) VALUES (
            'gold',
            '${params.tableNameLower}',
            '${params.tableType == "dim" ? "dim" : "fact"}_${params.tableNameLower}',
            'ice.silver.${params.tableNameLower}',
            'ice.gold.${params.tableType == "dim" ? "dim" : "fact"}_${params.tableNameLower}',
            '${params.ddl}',
            '${params.tableType == "dim" ? "" : "year,month,day,hour"}',
            '${params.pkColumns}', 
            '${params.transformSQL}',
            TRUE,
            NULL,
            60,
            'batch',
            'ice.silver.${params.tableNameLower}',
            'Gold ${params.tableType == "dim" ? "dimension" : "fact"} table - aggregated metrics from ${params.tableNameLower}',
            'gold,${params.tableType == "dim" ? "dimension" : "fact,aggregation,hourly"}',
            '${params.createdBy}'
        ) ON CONFLICT (layer, source_table_name) DO UPDATE SET
            target_table_ddl = EXCLUDED.target_table_ddl,
            target_partition_spec = EXCLUDED.target_partition_spec,
            transform_sql = EXCLUDED.transform_sql,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = '${params.createdBy}';
    `
	return goldConfigTemplate.trim();
}

export function silverDDL(params: DDLParams): SQLQuery {
	const DDL = `CREATE TABLE IF NOT EXISTS silver.${params.tableName} (
            
            ${params.allColumnsDefinitions != ""? `${params.allColumnsDefinitions},` : ""}

            offset BIGINT,
            year STRING,
            month STRING,
            day STRING,
            hour STRING
        )
        USING iceberg
        ${params.tableType == "fact" ? 'PARTITIONED BY (year, month, day, hour)' : ""}
        TBLPROPERTIES (
        ''write.parquet.compression-codec''=''snappy'',
        ''write.target-file-size-bytes''=''134217728''
        )
    `;
	return DDL.trim();
}


/**
 * -- ============================================================================
		-- SILVER LAYER CONFIG - ${params.tableNameUpper}
		-- Generated at: ${datetimeNow()}
		-- Schema Registry: ${params.schemaRegistryUrl}
		-- Subject: altibase_raw-${params.tableNameUpper}
		-- Total fields: $($Schema.fields.Count)
		-- ============================================================================
 * @param params 
 * 
 * @returns SQL Insert Query to etl-config-table
 */

export function silverConfig(params: ConfigParams): SQLQuery {
	const silverTableConfigTemplate = `INSERT INTO etl_table_config (
            layer,
            source_table_name,
            target_table_name,
            source_table_full_name,
            target_table_full_name,
            target_table_ddl,
            target_partition_spec,
            primary_key_columns,
            order_by_column,
            order_by_direction,
            enabled,
            batch_size,
            processing_interval_minutes,
            processing_mode,
            description,
            tags,
            created_by
        ) VALUES (
            'silver',
            '${params.tableNameUpper}',
            '${params.tableNameLower}',
            'bronze.altibase_raw',
            'ice.silver.${params.tableNameLower}',
            '${params.ddl}',
            '${params.tableType == "dim" ? "" : "year,month,day,hour"}',
            '${params.pkColumns}',
            'offset',
            'DESC',
            TRUE,
            10000,
            60,
            'batch',
            'Silver table for ${params.tableNameUpper} - cleaned and deduped from Bronze',
            'silver,fact,daily',
            '${params.createdBy}'
        ) ON CONFLICT (layer, source_table_name) DO UPDATE SET
            target_table_ddl = EXCLUDED.target_table_ddl,
            target_partition_spec = EXCLUDED.target_partition_spec,
            primary_key_columns = EXCLUDED.primary_key_columns,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = '${params.createdBy}';

    `;

	return silverTableConfigTemplate.trim();
}