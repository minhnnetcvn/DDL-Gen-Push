import { spawn } from "child_process"
import { NextResponse } from "next/server"
import { env } from "process";
import os from "os";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const shellUsed = (env.SHELL_USED ?? "powershell").toString().trim().toLowerCase();
    const isBashShell = shellUsed === "bash";
    const isPowerShell = shellUsed === "powershell" || !isBashShell;

    const scriptPath = isBashShell
      ? path.resolve(process.cwd(), "scripts", "generate-etl-configs.sh")
      : path.resolve(process.cwd(), "scripts", "generate-etl-configs.ps1");

    const isWindows = os.platform() === "win32";

    const result = await new Promise<{ success: boolean; output?: string; error?: string }>((resolve, reject) => {
      console.log(`shellUsed=${shellUsed}, scriptPath=${scriptPath}`);

      let child;
      if (isBashShell) {
        child = spawn("bash", [scriptPath, data.tableName, data.schemaRegistryUrl]);
      } else {
        const pwshCommand = isWindows ? "powershell.exe" : "pwsh";
        child = spawn(pwshCommand, [
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          scriptPath,
          "-registryUrl",
          data.schemaRegistryUrl,
          "-TableName",
          data.tableName,
        ]);
      }

      let stdout = ""
      let stderr = ""

      child.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      child.stderr.on("data", (data) => {
        stderr += data.toString()
        console.error("Script stderr:", stderr)
      })

      child.on("close", (code) => {
        console.log(`Shell process (${shellUsed}) exited with code:`, code)
        if (code === 0) {
          resolve({ success: true, output: stdout })
        } else {
          resolve({ success: false, error: stderr || "Script execution failed" })
        }
      })

      child.on("error", (error) => {
        console.error("Failed to start shell process:", error)
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