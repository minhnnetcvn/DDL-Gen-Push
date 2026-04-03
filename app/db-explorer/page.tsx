export const dynamic = "force-dynamic"
import DBExplorerClient from "./DBExplorerClient"

export default function Page() {
  const defaultIp = process.env.DEFAULT_IP_ADDRESS || ""

  console.log("DB EXPLORER ENV:", process.env.DEFAULT_IP_ADDRESS)

  return <DBExplorerClient defaultIp={defaultIp} />
}