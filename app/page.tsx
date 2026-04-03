export const dynamic = "force-dynamic"
import HomeClient from "@/components/HomeClient"

export default function Page() {
	const defaultIp = process.env.DEFAULT_IP_ADDRESS || ""

	console.log("ENV IP:", process.env.DEFAULT_IP_ADDRESS)

	return <HomeClient defaultIp={defaultIp} />
}