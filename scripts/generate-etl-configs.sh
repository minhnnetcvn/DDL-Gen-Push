#!/bin/bash

# ============================================================================
# Script: Generate ETL JSON for NodeJS from Schema Registry (Bash version)
# Description: Fetch Avro schema, build column→type map, and emit Silver/Gold DDL as JSON
# Usage:
#   ./generate-etl-configs.sh "TABLE_NAME" [schema_registry_url]
#   ./generate-etl-configs.sh "NEW_TABLE_NAME" "http://localhost:8081"
# Notes:
#   - Outputs a single JSON object to STDOUT.
#   - Requires: curl, jq
# ============================================================================

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 TABLE_NAME [registry_url]" >&2
  echo "Example: $0 'MY_TABLE' 'http://localhost:8081'" >&2
  exit 1
fi

TABLE_NAME="$1"
REGISTRY_URL="${2:-http://localhost:8081}"

log_verbose() {
  if [[ "${VERBOSE:-0}" -eq 1 ]]; then
    echo "[DEBUG] $*" >&2
  fi
}

get_schema_from_registry() {
  local subject="$1"
  local url="${REGISTRY_URL}/subjects/${subject}/versions/latest"
  
  log_verbose "Fetching schema from: $url"
  
  local response
  response=$(curl -s -f "$url" 2>/dev/null)
  
  if [[ $? -ne 0 ]]; then
    echo "Error: Failed to fetch schema from Schema Registry: $url" >&2
    return 1
  fi
  
  # Extract the 'schema' field which contains the actual schema JSON as a string
  echo "$response" | jq -r '.schema'
}

# ============================================================================
# Main
# ============================================================================

TABLE_NAME_UPPER=$(echo "$TABLE_NAME" | tr '[:lower:]' '[:upper:]')
SUBJECT="altibase_raw-${TABLE_NAME_UPPER}"

log_verbose "Fetching schema for subject: $SUBJECT"

# Fetch schema
SCHEMA=$(get_schema_from_registry "$SUBJECT")
if [[ -z "$SCHEMA" ]]; then
  echo "Error: Failed to fetch schema. Check Schema Registry at $REGISTRY_URL and subject '$SUBJECT'." >&2
  exit 1
fi

log_verbose "Successfully fetched schema"

# Parse schema and build output JSON
SCHEMA_PARSED=$(echo "$SCHEMA" | jq '.')

FIELD_COUNT=$(echo "$SCHEMA_PARSED" | jq '.fields | length')
log_verbose "Successfully fetched schema with $FIELD_COUNT fields"

# Build final JSON output
echo "$SCHEMA_PARSED" | jq \
  --arg table_name "$TABLE_NAME" \
  --arg registry_url "$REGISTRY_URL" \
  '{
    tableName: $table_name,
    schemaMap: [
      .fields[] |
      {
        name: .name,
        type: (
          if (.type | type) == "array" then
            (.type[] | select(. != "null") | 
             if (type == "string") then . 
             elif (type == "object" and has("type")) then
               (if has("logicalType") then "\(.type):\(.logicalType)" else .type end)
             else "string"
             end) as $avro |
            (($avro | ascii_downcase) as $lower |
             if $lower == "string" then "STRING"
             elif $lower == "int" or $lower == "integer" then "INT"
             elif $lower == "long" then "BIGINT"
             elif $lower == "float" then "FLOAT"
             elif $lower == "double" then "DOUBLE"
             elif $lower == "boolean" then "BOOLEAN"
             elif $lower == "bytes" then "BINARY"
             elif $lower == "long:timestamp-millis" then "TIMESTAMP"
             elif $lower == "long:timestamp-micros" then "TIMESTAMP"
             elif $lower == "int:date" then "DATE"
             elif $lower == "bytes:decimal" then "BIGINT"
             else "STRING"
             end)
          elif (.type | type) == "string" then
            ((.type | ascii_downcase) as $lower |
             if $lower == "string" then "STRING"
             elif $lower == "int" or $lower == "integer" then "INT"
             elif $lower == "long" then "BIGINT"
             elif $lower == "float" then "FLOAT"
             elif $lower == "double" then "DOUBLE"
             elif $lower == "boolean" then "BOOLEAN"
             elif $lower == "bytes" then "BINARY"
             else "STRING"
             end)
          elif (.type | type) == "object" and (.type | has("type")) then
            ((if (.type | has("logicalType")) then
               "\(.type.type):\(.type.logicalType)"
             else
               .type.type
             end | ascii_downcase) as $lower |
             if $lower == "string" then "STRING"
             elif $lower == "int" or $lower == "integer" then "INT"
             elif $lower == "long" then "BIGINT"
             elif $lower == "float" then "FLOAT"
             elif $lower == "double" then "DOUBLE"
             elif $lower == "boolean" then "BOOLEAN"
             elif $lower == "bytes" then "BINARY"
             elif $lower == "long:timestamp-millis" then "TIMESTAMP"
             elif $lower == "long:timestamp-micros" then "TIMESTAMP"
             elif $lower == "int:date" then "DATE"
             elif $lower == "bytes:decimal" then "BIGINT"
             else "STRING"
             end)
          else "STRING"
          end
        )
      }
    ],
    registryUrl: $registry_url
  }'

# ============================================================================
