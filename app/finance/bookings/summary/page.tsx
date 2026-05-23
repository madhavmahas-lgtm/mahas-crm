"use client";

import {
useEffect,
useState
}
from "react";

import {
supabase
}
from "@/lib/supabase";

export default function BookingSummary(){

const currentMonth =
new Date()
.toISOString()
.slice(0,7);

const [
fromDate,
setFromDate
] = useState(
`${currentMonth}-01`
);

const nextMonth =
new Date(
currentMonth + "-01"
);

nextMonth.setMonth(
nextMonth.getMonth()+1
);

const [
toDate,
setToDate
] = useState(
nextMonth
.toISOString()
.split("T")[0]
);

const [
summary,
setSummary
] = useState<any>(
{}
);

const [
sourceSummary,
setSourceSummary
] = useState<any>(
{}
);

const formatAmount =
(v:any)=>

Number(
v || 0
)

.toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
);

const loadSummary =
async()=>{

const {
data: bookings
} = await supabase
.from(
"bookings"
)
.select("*")
.gte(
"checkout_date",
fromDate
)
.lte(
"checkout_date",
toDate
);

const ids =
(bookings || [])
.map(
(b:any)=>
b.id
);

const {
data: payments
} = await supabase
.from(
"payments"
)
.select(
`
booking_id,
payment_amount,
card_charges
`
)
.in(
"booking_id",
ids
);

const sourceMap:any = {};
const result:any = {

gross:{
all:0,
elite:0,
vrindavan:0
},

gst:{
all:0,
elite:0,
vrindavan:0
},

commission:{
all:0,
elite:0,
vrindavan:0
},

gstComm:{
all:0,
elite:0,
vrindavan:0
},

tds:{
all:0,
elite:0,
vrindavan:0
},

tcs:{
all:0,
elite:0,
vrindavan:0
},

collected:{
all:0,
elite:0,
vrindavan:0
},

outstanding:{
all:0,
elite:0,
vrindavan:0
},

cardCharges:{
all:0,
elite:0,
vrindavan:0
}

};

(bookings || [])
.forEach(
(b:any)=>{

const prop =
b.property ===
"Mahas Elite"
?
"elite"
:
"vrindavan";

const source =
b.source_type
||
"Direct";

if(
!sourceMap[
source
]
){

sourceMap[
source
] = {

gross:0,
gst:0,
commission:0,
gstComm:0,
tds:0,
tcs:0,
collected:0,
outstanding:0

};
}

const gross =
Number(
b.gross_amount || 0
);

const gst =
Number(
b.gst_amount || 0
);

const comm =
Number(
b.commission_amount || 0
);

const gstComm =
Number(
b.gst_on_commission || 0
);

const tds =
Number(
b.tds || 0
);

const tcs =
Number(
b.tcs || 0
);

result.gross.all += gross;
result.gross[prop] += gross;

result.gst.all += gst;
result.gst[prop] += gst;

result.commission.all += comm;
result.commission[prop] += comm;

result.gstComm.all += gstComm;
result.gstComm[prop] += gstComm;

result.tds.all += tds;
result.tds[prop] += tds;

result.tcs.all += tcs;
result.tcs[prop] += tcs;

const bookingPayments =
(payments || [])
.filter(
(p:any)=>
p.booking_id === b.id
);

const collected =
bookingPayments.reduce(
(a:number,p:any)=>

a +
Number(
p.payment_amount || 0
)

,0
);

const card =
bookingPayments.reduce(
(a:number,p:any)=>

a +
Number(
p.card_charges || 0
)

,0
);

const outstanding =
gross -
collected;

result.collected.all += collected;
result.collected[prop] += collected;

result.outstanding.all += outstanding;
result.outstanding[prop] += outstanding;

result.cardCharges.all += card;
result.cardCharges[prop] += card;

sourceMap[
source
]
.gross += gross;

sourceMap[
source
]
.gst += gst;

sourceMap[
source
]
.commission += comm;

sourceMap[
source
]
.gstComm += gstComm;

sourceMap[
source
]
.tds += tds;

sourceMap[
source
]
.tcs += tcs;

sourceMap[
source
]
.collected += collected;

sourceMap[
source
]
.outstanding += outstanding;

}
);

setSummary(
result
);

setSourceSummary(
sourceMap
);

};

useEffect(()=>{
loadSummary();
},[
fromDate,
toDate
]);

const rows = [

[
"Gross Booking",
summary.gross
],

[
"GST",
summary.gst
],

[
"Commission",
summary.commission
],

[
"GST Comm",
summary.gstComm
],

[
"TDS",
summary.tds
],

[
"TCS",
summary.tcs
],

[
"Collected",
summary.collected
],

[
"Outstanding",
summary.outstanding
],

[
"Card Charges",
summary.cardCharges
]
];

return(

<div className="
p-4
space-y-4
">

<h2 className="
text-xl
font-bold
">
Booking Summary
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
border
rounded
overflow-auto
">

<table className="
w-full
table-fixed
text-sm
">

<thead>

<tr className="
border-b
font-bold
">

<th className="
w-1/4
text-left
p-2
">
Category
</th>

<th className="
w-1/4
text-right
p-2
">
All Properties
</th>

<th className="
w-1/4
text-right
p-2
">
Mahas Elite
</th>

<th className="
w-1/4
text-right
p-2
">
Mahas Vrindavan
</th>
</tr>

</thead>

<tbody>

{
rows.map(
([name,v]:any)=>(

<tr
key={name}
className="
border-b
"
>

<td className="
text-left
p-2
font-medium
">
{name}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v?.all
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v?.elite
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v?.vrindavan
)
}
</td>


</tr>

))
}

<tr
className="
font-bold
bg-gray-100
border-t-2
"
>

<td className="
font-bold
p-2
">
TOTAL Booking
</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
summary
.gross
?.all
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
summary
.gross
?.elite
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
summary
.gross
?.vrindavan
)
}

</td>

</tr>

</tbody>

</table>

</div>

<div className="
border
rounded
overflow-auto
mt-6
">

<h3 className="
font-bold
text-lg
p-2
">
Source Summary
</h3>

<table className="
min-w-[1400px]
text-sm
">

<thead>

<tr
className="
border-b
font-bold
"
>

<th className="
text-left
p-2
min-w-[140px]
">
Source
</th>

<th className="
text-right
p-2
min-w-[120px]
">
Gross
</th>

<th className="
text-right
p-2
min-w-[120px]
">
GST
</th>

<th className="
text-right
p-2
min-w-[120px]
">
Commission
</th>

<th className="
text-right
p-2
min-w-[120px]
">
GST Comm
</th>

<th className="
text-right
p-2
min-w-[100px]
">
TDS
</th>

<th className="
text-right
p-2
min-w-[100px]
">
TCS
</th>

<th className="
text-right
p-2
min-w-[120px]
">
Collected
</th>

<th className="
text-right
p-2
min-w-[140px]
">
Outstanding
</th>

</tr>

</thead>

<tbody>

{
Object.entries(
sourceSummary
)
.map(
([source,v]:any)=>(

<tr
key={source}
className="
border-b
"
>

<td className="
text-left
p-2
font-medium
text-blue-700
">
{source}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.gross
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.gst
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.commission
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.gstComm
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.tds
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
v.tcs
)
}
</td>

<td className="
text-right
p-2
text-green-700
">
₹{
formatAmount(
v.collected
)
}
</td>

<td className="
text-right
p-2
text-red-600
">
₹{
formatAmount(
v.outstanding
)
}
</td>

</tr>

))
}



<tr
className="
font-bold
bg-gray-100
border-t-2
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
Object.values(sourceSummary)
.reduce(
(a:any,v:any)=>
a + v.gross,
0
)
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
Object.values(sourceSummary)
.reduce(
(a:any,v:any)=>
a + v.gst,
0
)
)
}
</td>

<td className="
text-right
p-2
">
₹{
formatAmount(
Object.values(sourceSummary)
.reduce(
(a:any,v:any)=>
a + v.commission,
0
)
)
}
</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
Object.values(
sourceSummary
)
.reduce(
(a:any,v:any)=>
a + v.gstComm,
0
)
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
Object.values(
sourceSummary
)
.reduce(
(a:any,v:any)=>
a + v.tds,
0
)
)
}

</td>

<td className="
text-right
p-2
">

₹{
formatAmount(
Object.values(
sourceSummary
)
.reduce(
(a:any,v:any)=>
a + v.tcs,
0
)
)
}

</td>

<td className="
text-right
p-2
text-green-700
">
₹{
formatAmount(
Object.values(sourceSummary)
.reduce(
(a:any,v:any)=>
a + v.collected,
0
)
)
}
</td>

<td className="
text-right
p-2
text-red-600
">
₹{
formatAmount(
Object.values(sourceSummary)
.reduce(
(a:any,v:any)=>
a + v.outstanding,
0
)
)
}
</td>

</tr>

</tbody>

</table>

</div>

</div>

);

}