import { SilverConfigParams, GoldConfigParams, SilverDDLParams, GoldDDLParams } from "@/types/params";
import datetimeNow from "./timeGenerator";

function buildGoldDDL(params: GoldDDLParams): string {
    const goldDDL =   `
        CREATE TABLE IF NOT EXISTS ice.gold.fact_$TableNameLower (

        ${params.dimensionColumns}

        ${params.aggregateColumns}

        year  STRING,
        month STRING,
        day   STRING,
        hour  STRING
        )
        USING iceberg
        PARTITIONED BY (year, month, day, hour)
        TBLPROPERTIES (
        ''''write.parquet.compression-codec''''=''''snappy'''',
        ''''write.target-file-size-bytes''''=''''268435456''''
        )
    `;
    return goldDDL;
}

export function transformSQLContent(dimensionSQL: string, aggregateSQL: string): string {
  const transformSqlTemplate = `
      SELECT 
              -- TODO: Define dimension columns (must match DDL)
              -- dimension1,
              -- dimension2,
              ${dimensionSQL}

              -- TODO: Define aggregated metrics (must match DDL)
              -- SUM(amount) as total_amount,
              -- COUNT(*) as total_count,
              -- AVG(amount) as avg_amount,
              ${aggregateSQL}
              
              -- Partition columns (REQUIRED in SELECT and GROUP BY)
              year,
              month,
              day,
              hour
          FROM ice.silver.$TableNameLower
          WHERE year = ''''\${year}'''' 
            AND month = ''''\${month}'''' 
            AND day = ''''\${day}''''
            AND hour = ''''\${hour}''''
          GROUP BY 
              -- TODO: Define dimension columns (must match SELECT)
              -- dimension1,
              -- dimension2,
              ${dimensionSQL},
              -- Partition columns (REQUIRED in SELECT and GROUP BY)
              year,
              month,
              day,
              hour
      `;
  return transformSqlTemplate.trim().toUpperCase();
}

function goldConfig(params: GoldConfigParams): string {
    const goldConfigTemplate = `
        -- ============================================================================
        -- GOLD LAYER CONFIG (FACT TABLE) - ${params.tableNameUpper}
        -- Generated at: ${datetimeNow()}
        -- Source: ice.silver.${params.tableNameLower}
        -- Target: ice.gold.fact_${params.tableNameLower}
        -- ============================================================================

        INSERT INTO etl_table_config (
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
            'fact_${params.tableNameLower}',
            'ice.silver.${params.tableNameLower}',
            'ice.gold.fact_${params.tableNameLower}',
            '${params.goldDDL}',
            'year,month,day,hour',
            'year,month,day,hour',  -- TODO: Replace with actual composite PK (dimension columns + partition)
            '${params.transformSQL}',
            TRUE,
            NULL,
            60,
            'batch',
            'ice.silver.${params.tableNameLower}',
            'Gold fact table - aggregated metrics from ${params.tableNameLower}',
            'gold,fact,aggregation,hourly',
            '${params.createdBy}'
        ) ON CONFLICT (layer, source_table_name) DO UPDATE SET
            target_table_ddl = EXCLUDED.target_table_ddl,
            target_partition_spec = EXCLUDED.target_partition_spec,
            transform_sql = EXCLUDED.transform_sql,
            updated_at = CURRENT_TIMESTAMP,
            updated_by = '${params.createdBy}';

        -- ============================================================================
        -- END OF CONFIG
        -- ============================================================================
    `
    return goldConfigTemplate;
}

function silverDDL(params: SilverDDLParams): string {
    const silverTableDDL = `
        CREATE TABLE IF NOT EXISTS ice.silver.${params.tableNameLower} (
            ${params.ddlJoined}

             offset BIGINT,
            year STRING,
            month STRING,
            day STRING,
            hour STRING
        )
        USING iceberg
        PARTITIONED BY (year, month, day, hour)
        TBLPROPERTIES (
        'write.parquet.compression-codec'='snappy',
        'write.target-file-size-bytes'='134217728'
        )
    `;
    return silverTableDDL;
}


function silverConfig(params: SilverConfigParams): string {
    const silverTableConfigTemplate = `
        -- ============================================================================
        -- SILVER LAYER CONFIG - ${params.tableNameUpper}
        -- Generated at: ${datetimeNow()}
        -- Schema Registry: ${params.schemaRegistryUrl}
        -- Subject: altibase_raw-${params.tableNameUpper}
        -- Total fields: $($Schema.fields.Count)
        -- ============================================================================

        INSERT INTO etl_table_config (
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
            'ice.bronze.altibase_raw',
            'ice.silver.${params.tableNameLower}',
            '${params.ddl}',
            'year,month,day,hour',
            '${params.pkColumn}',
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
            updated_by = '$CreatedBy';

    `;

    return silverTableConfigTemplate;
}