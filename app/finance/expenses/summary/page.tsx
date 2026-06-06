"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ExpenseSummary(){

const [rows,setRows] =
useState<any[]>([]);

const [
selectedCategory,
setSelectedCategory
] = useState("");

const [
expenseDetails,
setExpenseDetails
] = useState<any[]>([]);

const currentMonth =
new Date()
.toISOString()
.slice(0,7);

const [fromDate,setFromDate] =
useState(
`${currentMonth}-01`
);

const nextMonth =
new Date(
currentMonth + "-01"
);

nextMonth.setMonth(
nextMonth.getMonth()+1
);

const [toDate,setToDate] =
useState(
nextMonth
.toISOString()
.split("T")[0]
);

const loadSummary =
async()=>{

const {data} =
await supabase
.from("expenses")
.select("*")
.gte(
"date",
fromDate
)
.lte(
"date",
toDate
);

const map:any = {};

(data || []).forEach(
(e)=>{

const cat =
e.category ||
"Misc";

if(
!map[cat]
){

map[cat] = {

all:0,
elite:0,
vrindavan:0,
common:0,

};

}

const amt =
Number(
e.gross_amount
||
e.net_amount
||
0
);

const eliteShare =
Number(
e.elite_share || 0
);

const vrindavanShare =
Number(
e.vrindavan_share || 0
);

map[cat].all += amt;

map[cat].elite +=
eliteShare;

map[cat].vrindavan +=
vrindavanShare;

if(
e.property ===
"Common"
){
  map[cat].common += amt;
}
}
);

setRows(
Object.entries(
map
)
);

};

useEffect(()=>{
loadSummary();
},[
fromDate,
toDate
]);

const formatAmount = (
value:any
)=>

Number(
value || 0
)

.toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);

const totals = {

all:0,
elite:0,
vrindavan:0,
common:0,

};

rows.forEach(
([_,v]:any)=>{

totals.all +=
Number(
v.all || 0
);

totals.elite +=
Number(
v.elite || 0
);

totals.vrindavan +=
Number(
v.vrindavan || 0
);

totals.common +=
Number(
v.common || 0
);

}
);

const loadDetails =
async(
category:string
)=>{

setSelectedCategory(
category
);

const {data} =
await supabase
.from(
"expenses"
)
.select("*")
.eq(
"category",
category
)
.gte(
"date",
fromDate
)
.lte(
"date",
toDate
)
.order(
"date",
{
ascending:false
}
);

setExpenseDetails(
data || []
);

};

return(

<div className="p-4 space-y-4">

<h2 className="text-xl font-bold">
Expense Summary
</h2>

<div className="
grid
grid-cols-2
gap-2
">

<input
type="date"
value={fromDate}
onChange={(e)=>
setFromDate(
e.target.value
)
}
className="
border
p-2
rounded
"
/>

<input
type="date"
value={toDate}
onChange={(e)=>
setToDate(
e.target.value
)
}
className="
border
p-2
rounded
"
/>

</div>

<div className="
overflow-auto
border
rounded
">

<table className="
w-full
text-sm
table-fixed
">

<thead>

<tr className="
border-b
font-bold
">

<th className="
w-1/5
text-left
p-2
">
Category
</th>

<th className="
w-1/5
text-right
p-2
">
All Properties
</th>

<th className="
w-1/5
text-right
p-2
">
Mahas Elite
</th>

<th className="
w-1/5
text-right
p-2
">
Mahas Vrindavan
</th>

<th className="
w-1/5
text-right
p-2
">
Common
</th>
</tr>

</thead>

<tbody>

{
rows.map(
([cat,v]:any)=>(
<tr
key={cat}
className="
border-b
"
>

<td
className="
text-left
p-2
font-medium
text-blue-700
cursor-pointer
underline
"
onClick={()=>
loadDetails(
cat
)
}
>

{cat}

</td>
<td className="
text-right
p-2
">

₹{
formatAmount(
v.all
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
v.elite
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.vrindavan
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.common
)
}
</td>

</tr>
))
}

<tr
className="
font-bold
border-t-2
bg-gray-100
"
>

<td className="
p-2
">
TOTAL
</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
totals.all
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
totals.elite
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
totals.vrindavan
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
totals.common
)
}

</td>

</tr>

</tbody>

</table>

</div>

{
selectedCategory
&&

<div
className="
border
rounded
p-3
space-y-3
"
>

<h3 className="
font-bold
text-lg
">

{
selectedCategory
}

Details

</h3>

<table
className="
w-full
text-sm
"
>

<thead>

<tr
className="
border-b
"
>

<th className="text-left p-2">
Date
</th>

<th className="text-left p-2">
Property
</th>

<th className="text-left p-2">
Paid To
</th>

<th className="text-right p-2">
Amount
</th>

</tr>

</thead>

<tbody>

{
expenseDetails.map(
(e)=>(
<tr
key={e.id}
className="
border-b
"
>

<td>
{e.date}
</td>

<td>
{e.property}
</td>

<td>
{e.paid_to}
</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
e.gross_amount
||
e.net_amount
)
}

</td>

</tr>
))
}

</tbody>

</table>

</div>
}

</div>

);

}