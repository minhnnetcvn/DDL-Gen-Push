import { transformSQLContent } from "@/app/helper/generateConfigs";
import ColumnDef from "@/types/ColumnDef";
import { spawn } from "child_process"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const Data = await request.json()

        // DDL column type
        // SQL Column only or aggregate as alias

        const { dimensionSQL, aggregateSQL, dimensionDDL, aggregateDDL } = generateColumnSQL(Data.columns)
        const SqlContentGold = Data.sqlContentGold
        const DDLTemplate = Data.goldDDL


        const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
            let goldDDL = buildGoldDDL(Data.columns, DDLTemplate, dimensionDDL, aggregateDDL);
            let transformSQL = transformSQLContent(dimensionSQL, aggregateSQL);
            const output = buildGoldConfig(SqlContentGold, goldDDL, transformSQL);
            // console.log(goldDDL);
            // console.log(transformSQL);
            resolve({success: true, output: output});
        })

        if (result.success) {
            return NextResponse.json({ success: true, sqlContentGold: result.output }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error: any) {
      console.error(error.message? error.message : error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// Helper function to build gold column definition
function buildAggregateColumnName(
  agg: string,
  columnName: string
) {
  // return `${agg.toLowerCase()}_${columnName}`
  return `${columnName}`
}

function buildAggregateSelect(
  agg: string,
  columnName: string
) {
  return `${agg.toUpperCase()}(${columnName}) AS ${buildAggregateColumnName(agg, columnName)}`
}

function generateColumnSQL(columns: ColumnDef[]) {
  const dimensions: string[] = []
  const aggregates: string[] = []
  const aggregateSQL: string[] = []
  let dimensionSQL: string[] = []

  for (const col of columns) {
    if (!col.aggregate) {
      // dimension
      dimensions.push(`  ${col.name} ${col.type}`)
      dimensionSQL.push(col.name)
    } else {
      // aggregate
      const aggSelect = buildAggregateSelect(col.aggregate, col.name)
      aggregateSQL.push(aggSelect)

      aggregates.push(
        `  ${col.name} ${col.type},  -- ${col.aggregate}(${col.name})`
      )
    }
  }

  return {
    dimensionSQL: dimensionSQL.join(',\n'),
    aggregateSQL: aggregateSQL.join(',\n'),
    dimensionDDL: dimensions.join(',\n'),
    aggregateDDL: aggregates.join(',\n')
  }
}

function buildGoldDDL(columns: ColumnDef[], table_template: string, dimensionDDL: string, aggregateDDL: string): string {

  return table_template
    .replace('{{DIMENSIONS}}', dimensionDDL || '  -- none')
    .replace('{{AGGREGATES}}', aggregateDDL || '  -- none')
}


function buildGoldConfig(SqlContentGold: string, goldDDL: string, transformSQL: string): string {
  return SqlContentGold
    .replace('{{GoldDDL}}', goldDDL || '  -- none')
    .replace('{{TransformSQL}}', transformSQL || '  -- none')
}