import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id); // "3" → 3
        return new Response(JSON.stringify({ success: true, message: "ETL config updated successfully." }), { status: 200 });
    }
    catch (error: any) {
        console.error("Error updating ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {    
    try {
        const {id} = await params; // "3" → 3

        const {poolCredentials: postgresData} = await request.json();
        console.log("Received ETL Config Deletion Request for ID:", id);
        console.log("Using Postgres Credentials:", postgresData);

        let query = `DELETE FROM ${postgresData.tableName} WHERE id = ${id};`;
        console.log(query);

        await pool(postgresData.host, postgresData.port, postgresData.user, postgresData.password, postgresData.db)
        .query(query)
        .then((res) => {
            console.log(`ETL Config with ID #${id} deleted successfully.`);
            console.log(res)
        })
        .catch((error) => {
            console.error("Error deleting ETL config:", error.message ? error.message : error);
            throw error;
        })
        .finally(() => {
            return new NextResponse(JSON.stringify({ success: true, message: `ETL Config with ID #${id} deleted successfully.` }), { status: 200 });
        });
        
        return new NextResponse(JSON.stringify({ success: true, message: `ETL Config with ID #${id} deleted successfully.` }), { status: 200 });
    }
    catch (error: any) {
        console.error("Error deleting ETL config:", error.message ? error.message : error);
        return new NextResponse(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
