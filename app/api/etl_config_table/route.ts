import { ETLConfig } from "@/components/etl-config-table";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
    let result : ETLConfig[] = [];
    try {
        const {poolCredentials: postgresData, queryFilters: queryData} = await request.json();
        console.log("Received ETL Config Data:", queryData);

        console.log( `SELECT * FROM ${postgresData.table}
            WHERE 
            ${queryData.tableName !== "" ? `source_table_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_name ILIKE \'%${queryData.tableName}%\'
            OR source_table_full_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_full_name ILIKE \'%${queryData.tableName}%\';` : " 1=1 "}
            ${queryData.layer === "all" ? "" : `AND layer = \'${queryData.layer}\'`}
            `);

        await pool(postgresData.host, postgresData.port, postgresData.user, postgresData.password, postgresData.db).query(
            `SELECT * FROM ${postgresData.tableName}
            WHERE 
            ${queryData.tableName !== "" ? `source_table_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_name ILIKE \'%${queryData.tableName}%\'
            OR source_table_full_name ILIKE \'%${queryData.tableName}%\'
            OR target_table_full_name ILIKE \'%${queryData.tableName}%\';` : " 1=1 "}
            ${queryData.layer === "all" ? "" : `AND layer = \'${queryData.layer}\'`}
            `
        )
        .then((res) => {
            // console.log("ETL Config Query Results:", res.rows);
            // return Response.json({ success: true, data: res.rows });
            result = res.rows;
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

export async function PUT(request: Request) {
    try {
        const etlConfigData = await request.json();
        console.log("Received ETL Config Data for Update:", etlConfigData);
        return new Response(JSON.stringify({ success: true, message: "ETL config updated successfully." }), { status: 200 });
    }
    catch (error: any) {
        console.error("Error updating ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

export async function DELETE(request: Request) {    
    try {
        const etlConfigData = await request.json();
        console.log("Received ETL Config Data for Deletion:", etlConfigData);
        return new Response(JSON.stringify({ success: true, message: "ETL config deleted successfully." }), { status: 200 });
    }
    catch (error: any) {
        console.error("Error deleting ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
