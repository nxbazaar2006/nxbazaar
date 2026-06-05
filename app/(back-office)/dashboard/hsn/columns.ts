import { ColumnDef } from "@tanstack/react-table"

type HsnColumn = {
id:string
hsnCode:string
description:string
cgst:number
sgst:number
igst:number
}

export const columns:ColumnDef<HsnColumn>[] = [

{
accessorKey:"hsnCode",
header:"HSN"
},

{
accessorKey:"description",
header:"Description"
},

{
accessorKey:"cgst",
header:"CGST"
},

{
accessorKey:"sgst",
header:"SGST"
},

{
accessorKey:"igst",
header:"IGST"
},

{
id:"actions",
header:"Actions"
}

]
