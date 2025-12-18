
# ============================================================================
# Script: Generate ETL JSON for NodeJS from Schema Registry
# Description: Fetch Avro schema, build column→type map, and emit Silver/Gold DDL as JSON
# Usage:
#   .\generate-etl-json.ps1 -TableName "NEW_TABLE_NAME" [-SchemaRegistryUrl "http://localhost:8081"]
#                           [-PrimaryKeyColumn "_id"] [-CreatedBy "admin"] [-SilverOnly] [-GoldOnly] [-Verbose]
# Notes:
#   - Outputs a single JSON object to STDOUT. Avoid -Verbose in production when piping to Node.js.
#   - Removed all file writing and the OutputFile parameter.
# ============================================================================

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

# ============================================================================
# Helper Functions
# ============================================================================

function Convert-AvroTypeToSparkType {
  param([object]$TypeNode)

  $avroType = ""

  # Handle union types: ["null","string"] -> "string"
  if ($TypeNode -is [System.Array]) {
    foreach ($t in $TypeNode) {
      if ($t -is [string] -and $t -ne "null") {
        $avroType = $t
        break
      } elseif ($t -is [PSCustomObject] -and $t.type) {
        $avroType = $t.type
        if ($t.logicalType) {
          $avroType = "$($t.type):$($t.logicalType)"
        }
        break
      }
    }
  }
  elseif ($TypeNode -is [string]) {
    $avroType = $TypeNode
  }
  elseif ($TypeNode -is [PSCustomObject] -and $TypeNode.type) {
    $avroType = $TypeNode.type
    if ($TypeNode.logicalType) {
      $avroType = "$($TypeNode.type):$($TypeNode.logicalType)"
    }
  }

  switch ($avroType.ToLower()) {
    "string" { return "STRING" }
    "int"    { return "INT" }
    "integer"{ return "INT" }
    "long"   { return "BIGINT" }
    "float"  { return "FLOAT" }
    "double" { return "DOUBLE" }
    "boolean"{ return "BOOLEAN" }
    "bytes"  { return "BINARY" }
    { $_ -match "^long:timestamp-millis$" } { return "TIMESTAMP" }
    { $_ -match "^long:timestamp-micros$" } { return "TIMESTAMP" }
    { $_ -match "^int:date$" }              { return "DATE" }
    { $_ -match "^bytes:decimal$" }         { return "DECIMAL(18,2)" }
    default {
      Write-Verbose "Unknown Avro type: $avroType, defaulting to STRING"
      return "STRING"
    }
  }
}

function Get-SchemaFromRegistry {
  param([string]$Subject)

  try {
    $url = "$SchemaRegistryUrl/subjects/$Subject/versions/latest"
    Write-Verbose "Fetching schema from: $url"
    $response = Invoke-RestMethod -Uri $url -Method GET -ErrorAction Stop

    # FIX: correctly parse nested 'schema' JSON string
    $schemaJson = $response.schema | ConvertFrom-Json  # original script had a pipe omission
    return $schemaJson
  } catch {
    Write-Error "Failed to fetch schema from Schema Registry: $_"
    return $null
  }
}

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
{{DIMENSIONS}}
  -- TODO: Define aggregated metrics

{{AGGREGATES}}

  -- Partition columns (REQUIRED)
  year  STRING,
  month STRING,
  day   STRING,
  hour  STRING
)
USING iceberg
PARTITIONED BY (year, month, day, hour)
TBLPROPERTIES (
  'write.parquet.compression-codec'='snappy',
  'write.target-file-size-bytes'='268435456'
)
"@
  return $ddl
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

if (-not $GoldOnly) {
  Write-Verbose "Generating Silver DDL..."
  $silverDDL = Generate-SilverDDL -Schema $schema -TableNameLower $TableNameLower
}

if (-not $SilverOnly) {
  Write-Verbose "Generating Gold DDL..."
  $goldDDL = Generate-GoldDDL -Schema $schema -TableNameLower $TableNameLower
}

# Compose final JSON object
$result = [PSCustomObject]@{
  tableNameUpper = $TableNameUpper
  tableNameLower = $TableNameLower
  schema         = $schemaMap           # map of column → Spark type
  silverSql      = $silverDDL           # Silver DDL (null if -GoldOnly)
  goldSql        = $goldDDL             # Gold DDL (null if -SilverOnly)
  createdBy      = $CreatedBy
  registryUrl    = $SchemaRegistryUrl
  subject        = $subject
}

# IMPORTANT: Emit ONLY JSON on STDOUT
$result | ConvertTo-Json -Depth 6
# ============================================================================