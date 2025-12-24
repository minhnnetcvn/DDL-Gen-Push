import { pool } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const {poolCredentials: postgresData, sqlContentSilver, sqlContentGold} = await request.json();
        // console.log("Received ETL Config Data:", sqlContentSilver, sqlContentGold);


        await pool(postgresData.host, postgresData.port, postgresData.user, postgresData.password, postgresData.db).query(sqlContentSilver);
        await pool(postgresData.host, postgresData.port, postgresData.user, postgresData.password, postgresData.db).query(sqlContentGold);

        // Here you can add logic to process the ETL config data as needed
        return new Response(JSON.stringify({ success: true, message: "ETL config received successfully." }), { status: 200 });
    } catch (error: any) {
        console.error("Error processing ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

}

export async function GET() {
    return new Response(JSON.stringify({ message: "ETL Config API is running." }), { status: 200 });
}

export async function PUT(request: Request) {
    try {
        const etlConfigData = await request.json();
        // console.log("Received ETL Config Data for Update:", etlConfigData);
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
        // console.log("Received ETL Config Data for Deletion:", etlConfigData);
        return new Response(JSON.stringify({ success: true, message: "ETL config deleted successfully." }), { status: 200 });
    }
    catch (error: any) {
        console.error("Error deleting ETL config:", error.message ? error.message : error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}