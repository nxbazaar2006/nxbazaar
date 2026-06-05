import { columns } from "./columns"
import DataTable from "@/components/DataTable"

async function getHsnCodes(){

const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hsn`)

return res.json()

}

export default async function Page(){

const data = await getHsnCodes()

return(

<DataTable columns={columns} data={data}/>

)

}
