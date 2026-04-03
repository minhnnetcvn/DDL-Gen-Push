import { pool } from '@/lib/db'

async function insertConfigRow() {
	const sql = `
    INSERT INTO etl_table_config
      (table_name, column_name, data_type, aggregate_method)
    VALUES ($1, $2, $3, $4)
  `

	const values = [
		'ice.gold.fact_toll_stage',
		'car_count',
		'DECIMAL(18,2)',
		'SUM'
	]

	await pool().query(sql, values)
}

// export async function POST(req: Request) {
// 	const body = await req.json()
//
// 	await bulkInsertConfigs(
// 		body.tableName,
// 		body.columns
// 	)
//
// 	return Response.json({ success: true })
// }
