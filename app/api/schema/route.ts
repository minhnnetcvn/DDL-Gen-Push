import { spawn } from "child_process"
import { NextResponse } from "next/server"
import { env } from "process";

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
      // Spawn PowerShell process
      const ps = spawn(env.NODE_ENV == "production"? "pwsh": "powershell.exe", [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "..\\etl-table-config-crud\\scripts\\generate-etl-configs.ps1",
        "-registryUrl",
        data.schemaRegistryUrl,
        "-TableName",
        data.tableName,
      ])

      let stdout = ""
      let stderr = ""

      ps.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      ps.stderr.on("data", (data) => {
        stderr += data.toString()
        console.error("PowerShell stderr:", stderr)
      })

      ps.on("close", (code) => {
        console.log("PowerShell process exited with code:", code)
        if (code === 0) {
          resolve({ success: true, output: stdout })
        } else {
          resolve({ success: false, error: stderr || "PowerShell script failed" })
        }
      })

      ps.on("error", (error) => {
        console.error("Failed to start PowerShell process:", error)
        resolve({ success: false, error: error.message })
      })
    })

    if (result.success) {
      return NextResponse.json(JSON.parse(result.output || "{}"))
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}