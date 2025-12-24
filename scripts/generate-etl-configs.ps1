
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
  [string]$registryUrl = "http://localhost:8081"
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
    { $_ -match "^bytes:decimal$" }         { return "FLOAT" }
    default {
      Write-Verbose "Unknown Avro type: $avroType, defaulting to STRING"
      return "STRING"
    }
  }
}

function Get-SchemaFromRegistry {
  param([string]$Subject)

  try {
    $url = "$registryUrl/subjects/$Subject/versions/latest"
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

# Compose final JSON object
$result = [PSCustomObject]@{
  tableName = $TableName
  schema         = $schemaMap           # map of column → Spark type
  registryUrl    = $registryUrl
}

# IMPORTANT: Emit ONLY JSON on STDOUT
$result | ConvertTo-Json -Depth 6
# ============================================================================