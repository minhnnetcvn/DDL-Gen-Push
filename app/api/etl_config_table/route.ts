import { pool } from "@/lib/db";
import { ETLConfig } from "@/types/ETLConfig";

export async function POST(request: Request) {
    let result : ETLConfig[] = [];
    try {
        const {poolCredentials: postgresData, queryFilters: queryData} = await request.json();

        const query = `SELECT * FROM ${postgresData.tableName}
            ${queryData.tableName !== "" || queryData.layer !== "all" ? "WHERE" : ""}
            ${queryData.tableName !== "" ? `source_table_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_name ILIKE \'%${queryData.tableName}%\'
            OR source_table_full_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_full_name ILIKE \'%${queryData.tableName}%\';` : ""}
            ${queryData.tableName !== "" && queryData.layer !== "all" ? ' AND ' : ''}
            ${queryData.layer === "all" ? "" : `layer = \'${queryData.layer}\'`}
        `;
        // console.log("ETL Config Query:", query);

        await pool(postgresData.host, postgresData.port, postgresData.user, postgresData.password, postgresData.db).query(
            query
        )
        .then((res) => {
            result = res.rows;
            return Response.json({ success: true, data: result });// Close the database pool if necessary
        });
        // Here you can add logic to process the ETL config data as needed
        
    } catch (error: any) {
        console.error("Error processing ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
    finally {
        return Response.json({ success: true, data: result });// Close the database pool if necessary
    }

}

export async function GET() {
    return new Response(JSON.stringify({ message: "ETL Config API is running." }), { status: 200 });
}

