import scriptPath from "@/app/helper/pathResolver";
import { spawn } from "child_process"
import { NextResponse } from "next/server"
import { env } from "process";
import os from "os";

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const isWindows = os.platform() === "win32";

    const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
      // Spawn PowerShell process
      console.log(scriptPath);
      const ps = spawn(isWindows? "powershell.exe": "pwsh", [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        `${scriptPath}`,
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
      console.log(JSON.parse(result.output!));
      return NextResponse.json(JSON.parse(result.output || "{}"))
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}