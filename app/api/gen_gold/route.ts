import ColumnDef from "@/types/ColumnDef";
import { spawn } from "child_process"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log(data);
        const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
          const output = buildCreateTableSQL(data.columns, data.goldDLL)
          resolve({ success: true, output: output })
        })

        if (result.success) {
            return NextResponse.json(result.output)
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 })
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// Helper function to build gold column definition
function buildAggregateColumnName(
  agg: string,
  columnName: string
) {
  return `${agg.toLowerCase()}_${columnName}`
}

function generateColumnSQL(columns: ColumnDef[]) {
  const dimensions: string[] = []
  const aggregates: string[] = []

  for (const col of columns) {
    if (!col.aggregate) {
      // dimension
      dimensions.push(`  ${col.name} ${col.type}`)
    } else {
      // aggregate
      const aggColName = buildAggregateColumnName(col.aggregate, col.name)

      aggregates.push(
        `  ${aggColName} ${col.type},  -- ${col.aggregate}(${col.name})`
      )
    }
  }

  return {
    dimensionSQL: dimensions.join(',\n'),
    aggregateSQL: aggregates.join(',\n')
  }
}

function buildCreateTableSQL(columns: ColumnDef[], table_template: string): string {
  const { dimensionSQL, aggregateSQL } = generateColumnSQL(columns)

  return table_template
    .replace('{{DIMENSIONS}}', dimensionSQL || '  -- none')
    .replace('{{AGGREGATES}}', aggregateSQL || '  -- none')
}
