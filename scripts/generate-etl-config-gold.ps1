param(
  [Parameter(Mandatory=$true)]
  [string]$TableName,

  [Parameter(Mandatory=$false)]
  [string]$SchemaRegistryUrl = "http://localhost:8081",

  [Parameter(Mandatory=$false)]
  [string]$PrimaryKeyColumn = "",

  [Parameter(Mandatory=$false)]
  [string]$CreatedBy = "admin",

  [Parameter(Mandatory=$false)]
  [switch]$SilverOnly,

  [Parameter(Mandatory=$false)]
  [switch]$GoldOnly
)

function Generate-SilverDDL {
  param([object]$Schema, [string]$TableNameLower)

  $columns = @()

  # Business columns from Avro schema
  foreach ($field in $Schema.fields) {
    $fieldName = $field.name
    $sparkType = Convert-AvroTypeToSparkType -TypeNode $field.type
    $columns += " $fieldName $sparkType"
  }

  # Required metadata columns
  $columns += " offset BIGINT"
  $columns += " year STRING"
  $columns += " month STRING"
  $columns += " day STRING"
  $columns += " hour STRING"

  $ddl = @"
CREATE TABLE IF NOT EXISTS ice.silver.$TableNameLower (
$($columns -join ",`n")
)
USING iceberg
PARTITIONED BY (year, month, day, hour)
TBLPROPERTIES (
  'write.parquet.compression-codec'='snappy',
  'write.target-file-size-bytes'='134217728'
)
"@
  return $ddl
}

function Generate-GoldDDL {
  param([object]$Schema, [string]$TableNameLower)

  # Template for fact table; customize as needed
  $ddl = @"
CREATE TABLE IF NOT EXISTS ice.gold.fact_$TableNameLower (
  -- TODO: Define dimension columns (GROUP BY keys)
  -- Example:
  -- dimension1 STRING,
  -- dimension2 DOUBLE,
{{DIMENSIONS}},
  -- TODO: Define aggregated metrics

{{AGGREGATES}},

  -- Partition columns (REQUIRED)
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
"@
  return $ddl
}

function Generate-SilverConfig {
    param([string]$TableNameUpper, [string]$TableNameLower, [object]$Schema)
    
    # Auto-detect primary key if not provided
    $pkColumn = $PrimaryKeyColumn
    if ([string]::IsNullOrEmpty($pkColumn)) {
        # Try common patterns
        $commonPkPatterns = @("_id", "id", "key", "_key")
        foreach ($pattern in $commonPkPatterns) {
            $found = $Schema.fields | Where-Object { $_.name -like "*$pattern" }
            if ($found) {
                $pkColumn = $found[0].name
                break
            }
        }
        
        if ([string]::IsNullOrEmpty($pkColumn)) {
            $pkColumn = $Schema.fields[0].name
            Write-Warning "No primary key specified, using first field: $pkColumn"
        }
    }
    
    $ddl = Generate-SilverDDL -Schema $Schema -TableNameLower $TableNameLower
    
    # Escape single quotes in DDL for SQL
    $ddlEscaped = $ddl.Replace("'", "''")
    
    $sql = @"
-- ============================================================================
-- SILVER LAYER CONFIG - $TableNameUpper
-- Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Schema Registry: $SchemaRegistryUrl
-- Subject: altibase_raw-$TableNameUpper
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
    '$TableNameUpper',
    '$TableNameLower',
    'ice.bronze.altibase_raw',
    'ice.silver.$TableNameLower',
    '$ddlEscaped',
    'year,month,day,hour',
    '$pkColumn',
    'offset',
    'DESC',
    TRUE,
    10000,
    60,
    'batch',
    'Silver table for $TableNameUpper - cleaned and deduped from Bronze',
    'silver,fact,daily',
    '$CreatedBy'
) ON CONFLICT (layer, source_table_name) DO UPDATE SET
    target_table_ddl = EXCLUDED.target_table_ddl,
    target_partition_spec = EXCLUDED.target_partition_spec,
    primary_key_columns = EXCLUDED.primary_key_columns,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = '$CreatedBy';

"@
    
    return $sql
}

function Generate-GoldConfig {
    param([string]$TableNameUpper, [string]$TableNameLower, [object]$Schema)
    
    # Escape single quotes
    $sql = @"
-- ============================================================================
-- GOLD LAYER CONFIG (FACT TABLE) - $TableNameUpper
-- Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Source: ice.silver.$TableNameLower
-- Target: ice.gold.fact_$TableNameLower
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
    '$TableNameLower',
    'fact_$TableNameLower',
    'ice.silver.$TableNameLower',
    'ice.gold.fact_$TableNameLower',
    '{{GoldDDL}}',
    'year,month,day,hour',
    'year,month,day,hour',  -- TODO: Replace with actual composite PK (dimension columns + partition)
    '{{TransformSQL}}',
    TRUE,
    NULL,
    60,
    'batch',
    'ice.silver.$TableNameLower',
    'Gold fact table - aggregated metrics from $TableNameLower',
    'gold,fact,aggregation,hourly',
    '$CreatedBy'
) ON CONFLICT (layer, source_table_name) DO UPDATE SET
    target_table_ddl = EXCLUDED.target_table_ddl,
    target_partition_spec = EXCLUDED.target_partition_spec,
    transform_sql = EXCLUDED.transform_sql,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = '$CreatedBy';

"@
    
    return $sql
}


function Get-SchemaColumnTypeMap {
  param([object]$Schema)

  $map = @{}
  foreach ($field in $Schema.fields) {
    $map[$field.name] = Convert-AvroTypeToSparkType -TypeNode $field.type
  }
  return $map
}

# ============================================================================
# Main
# ============================================================================

$TableNameUpper = $TableName.ToUpper()
$TableNameLower = $TableName.ToLower()

$subject = "altibase_raw-$TableNameUpper"
Write-Verbose "Fetching schema for subject: $subject"

$schema = Get-SchemaFromRegistry -Subject $subject
if ($null -eq $schema) {
  Write-Error "Failed to fetch schema. Check Schema Registry at $SchemaRegistryUrl and subject '$subject'."
  exit 1
}

Write-Verbose "Successfully fetched schema with $($schema.fields.Count) fields"

# Build column→type map
$schemaMap = Get-SchemaColumnTypeMap -Schema $schema

# Generate DDLs conditionally
$silverDDL = $null
$goldDDL   = $null
$sqlContentSilver = $null
$sqlContentGold   = $null

function Generate-SilverDDL {
  param([object]$Schema, [string]$TableNameLower)

  $columns = @()

  # Business columns from Avro schema
  foreach ($field in $Schema.fields) {
    $fieldName = $field.name
    $sparkType = Convert-AvroTypeToSparkType -TypeNode $field.type
    $columns += " $fieldName $sparkType"
  }

  # Required metadata columns
  $columns += " offset BIGINT"
  $columns += " year STRING"
  $columns += " month STRING"
  $columns += " day STRING"
  $columns += " hour STRING"

  $ddl = @"
CREATE TABLE IF NOT EXISTS ice.silver.$TableNameLower (
$($columns -join ",`n")
)
USING iceberg
PARTITIONED BY (year, month, day, hour)
TBLPROPERTIES (
  'write.parquet.compression-codec'='snappy',
  'write.target-file-size-bytes'='134217728'
)
"@
  return $ddl
}

function Generate-GoldDDL {
  param([object]$Schema, [string]$TableNameLower)

  # Template for fact table; customize as needed
  $ddl = @"
CREATE TABLE IF NOT EXISTS ice.gold.fact_$TableNameLower (

{{DIMENSIONS}}

{{AGGREGATES}}

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
"@
  return $ddl
}

function Generate-SilverConfig {
    param([string]$TableNameUpper, [string]$TableNameLower, [object]$Schema)
    
    # Auto-detect primary key if not provided
    $pkColumn = $PrimaryKeyColumn
    if ([string]::IsNullOrEmpty($pkColumn)) {
        # Try common patterns
        $commonPkPatterns = @("_id", "id", "key", "_key")
        foreach ($pattern in $commonPkPatterns) {
            $found = $Schema.fields | Where-Object { $_.name -like "*$pattern" }
            if ($found) {
                $pkColumn = $found[0].name
                break
            }
        }
        
        if ([string]::IsNullOrEmpty($pkColumn)) {
            $pkColumn = $Schema.fields[0].name
            Write-Warning "No primary key specified, using first field: $pkColumn"
        }
    }
    
    $ddl = Generate-SilverDDL -Schema $Schema -TableNameLower $TableNameLower
    
    # Escape single quotes in DDL for SQL
    $ddlEscaped = $ddl.Replace("'", "''")
    
    $sql = @"
-- ============================================================================
-- SILVER LAYER CONFIG - $TableNameUpper
-- Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Schema Registry: $SchemaRegistryUrl
-- Subject: altibase_raw-$TableNameUpper
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
    '$TableNameUpper',
    '$TableNameLower',
    'ice.bronze.altibase_raw',
    'ice.silver.$TableNameLower',
    '$ddlEscaped',
    'year,month,day,hour',
    '$pkColumn',
    'offset',
    'DESC',
    TRUE,
    10000,
    60,
    'batch',
    'Silver table for $TableNameUpper - cleaned and deduped from Bronze',
    'silver,fact,daily',
    '$CreatedBy'
) ON CONFLICT (layer, source_table_name) DO UPDATE SET
    target_table_ddl = EXCLUDED.target_table_ddl,
    target_partition_spec = EXCLUDED.target_partition_spec,
    primary_key_columns = EXCLUDED.primary_key_columns,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = '$CreatedBy';

"@
    
    return $sql
}

function Generate-GoldConfig {
    param([string]$TableNameUpper, [string]$TableNameLower, [object]$Schema)
    
    # Escape single quotes
    $sql = @"
-- ============================================================================
-- GOLD LAYER CONFIG (FACT TABLE) - $TableNameUpper
-- Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- Source: ice.silver.$TableNameLower
-- Target: ice.gold.fact_$TableNameLower
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
    '$TableNameLower',
    'fact_$TableNameLower',
    'ice.silver.$TableNameLower',
    'ice.gold.fact_$TableNameLower',
    '{{GoldDDL}}',
    'year,month,day,hour',
    'year,month,day,hour',  -- TODO: Replace with actual composite PK (dimension columns + partition)
    '{{TransformSQL}}',
    TRUE,
    NULL,
    60,
    'batch',
    'ice.silver.$TableNameLower',
    'Gold fact table - aggregated metrics from $TableNameLower',
    'gold,fact,aggregation,hourly',
    '$CreatedBy'
) ON CONFLICT (layer, source_table_name) DO UPDATE SET
    target_table_ddl = EXCLUDED.target_table_ddl,
    target_partition_spec = EXCLUDED.target_partition_spec,
    transform_sql = EXCLUDED.transform_sql,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = '$CreatedBy';

"@
    
    return $sql
}

if (-not $GoldOnly) {
  Write-Verbose "Generating Silver DDL..."
  $silverDDL = Generate-SilverDDL -Schema $schema -TableNameLower $TableNameLower
  $silverSql = Generate-SilverConfig -TableNameUpper $TableNameUpper -TableNameLower $TableNameLower -Schema $schema
  $sqlContentSilver += $silverSql
}

if (-not $SilverOnly) {
  Write-Verbose "Generating Gold DDL..."
  $goldDDL = Generate-GoldDDL -Schema $schema -TableNameLower $TableNameLower
  $goldSql = Generate-GoldConfig -TableNameUpper $TableNameUpper -TableNameLower $TableNameLower -Schema $schema
  $sqlContentGold += $goldSql
}

# Compose final JSON object
$result = [PSCustomObject]@{
  tableNameUpper = $TableNameUpper
  tableNameLower = $TableNameLower
  schema         = $schemaMap           # map of column → Spark type
  silverSql      = $silverDDL           # Silver DDL (null if -GoldOnly)
  goldSql        = $goldDDL             # Gold DDL (null if -SilverOnly)
  sqlContentSilver = $sqlContentSilver
  sqlContentGold = $sqlContentGold
  createdBy      = $CreatedBy
  registryUrl    = $SchemaRegistryUrl
  subject        = $subject
}

# IMPORTANT: Emit ONLY JSON on STDOUT
$result | ConvertTo-Json -Depth 6
# ============================================================================

