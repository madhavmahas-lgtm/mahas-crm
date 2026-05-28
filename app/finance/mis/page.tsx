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

export default function MISDashboard(){

const currentMonth =
new Date()
.toISOString()
.slice(0,7);

const nextMonth =
new Date(
currentMonth + "-01"
);

nextMonth.setMonth(
nextMonth.getMonth()+1
);

const [
fromDate,
setFromDate
] = useState(
`${currentMonth}-01`
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
role,
setRole
] = useState("");

const [
userProperty,
setUserProperty
] = useState("");

const [
propertyFilter,
setPropertyFilter
]
=
useState(
"All Properties"
);

const [
data,
setData
] = useState({

revenue:0,

profit:0,

expenses:0,

paymentSummary:{

bank:0,

cash:0,

upi:0,

card:0

},

categorySummary:{},

sourceSummary:{}

});

const loadMIS =
async()=>{

const {
data: bookings
}
=
await supabase
.from(
"bookings"
)
.select(
`
id,
property,
gross_amount,
checkout_date,
source_type,
commission_amount
`
)
.gte(
"checkout_date",
fromDate
)
.lte(
"checkout_date",
toDate
);

const {
data: expenses
}
=
await supabase
.from(
"expenses"
)
.select(
`
property,
gross_amount,
net_amount,
date,
payment_mode,
category
`
)
.gte(
"date",
fromDate
)
.lte(
"date",
toDate
);

let revenue = 0;

let expense = 0;

let paymentSummary = {

bank:0,

cash:0,

upi:0,

card:0


};

let categorySummary:any = {};
let sourceSummary:any = {};
let filteredBookings =
bookings || [];

if(
propertyFilter
!==
"All Properties"
){

filteredBookings =
filteredBookings.filter(
(b:any)=>

b.property
===
propertyFilter

);

}


(filteredBookings || [])
.forEach(
(b:any)=>{

const gross =
Number(
b.gross_amount
||0
);

revenue += gross;

const src =
b.source_type
||
"Direct";

if(
!sourceSummary[
src
]
){

sourceSummary[
src
] = {

gross:0,

commission:0,

collected:0,

outstanding:0

};

}

sourceSummary[
src
].gross += gross;

sourceSummary[
src
].commission +=
Number(
b.commission_amount
||0
);

sourceSummary[
src
].outstanding +=
gross;

}
);

let filteredExpenses =
expenses || [];

if(
propertyFilter
===
"Mahas Elite"
){

filteredExpenses =
filteredExpenses.filter(
(e:any)=>

e.property
===
"Mahas Elite"

||

e.property
===
"Common"

);

}

else if(
propertyFilter
===
"Mahas Vrindavan"
){

filteredExpenses =
filteredExpenses.filter(
(e:any)=>

e.property
===
"Mahas Vrindavan"

||

e.property
===
"Common"

);

}

(filteredExpenses || [])
.forEach(
(e:any)=>{

const amt =
Number(
e.gross_amount
||
e.net_amount
||
0
);

let finalAmt =
amt;

if(
e.property
===
"Common"
){

if(
propertyFilter
===
"Mahas Elite"
){

finalAmt =
amt / 3;

}

else if(
propertyFilter
===
"Mahas Vrindavan"
){

finalAmt =
(
amt * 2
)
/3;

}

}

expense += finalAmt;

const cat =
e.category
||
"Misc";

if(
!categorySummary[
cat
]
){

categorySummary[
cat
] = 0;

}

categorySummary[
cat
] += finalAmt;

const mode =
(
e.payment_mode
||
""
)
.toLowerCase();

if(
mode.includes(
"bank"
)
){

paymentSummary.bank += finalAmt;

}

else if(
mode.includes(
"cash"
)
){

paymentSummary.cash += finalAmt;

}

else if(
mode.includes(
"upi"
)
){

paymentSummary.upi += finalAmt;

}

else if(
mode.includes(
"card"
)
){

paymentSummary.card += finalAmt;

}

}
);

const {
data: payments
}
=
await supabase
.from(
"payments"
)
.select(
`
booking_id,
payment_amount
`
);

(filteredBookings || [])
.forEach(
(b:any)=>{

const src =
b.source_type
||
"Direct";

const bookingPayments =
(payments || [])
.filter(
(p:any)=>
p.booking_id
=== b.id
);

const collected =
bookingPayments
.reduce(
(
a:number,
p:any
)=>

a +

Number(
p.payment_amount
||0
)

,0
);

sourceSummary[
src
].collected +=
collected;

sourceSummary[
src
].outstanding -=
collected;

}
);

setData({

revenue,

expenses:
expense,

profit:
revenue
-
expense,

paymentSummary,

categorySummary,

sourceSummary

});
};

useEffect(()=>{

const r =
sessionStorage.getItem(
"finance_role"
)
||"";

const p =
sessionStorage.getItem(
"finance_property"
)
||"";

setRole(r);

setUserProperty(p);

if(
r === "director"
&&
p
){

setPropertyFilter(p);

}

},[]);

useEffect(()=>{
loadMIS();
},[
fromDate,
toDate,
propertyFilter
]);

const fmt =
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

return(

<div className="
container
space-y-6
">

<h1 className="
text-2xl
font-bold
text-center
">

Owner MIS Dashboard

</h1>

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
input
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
input
"
/>
======
{
!(
role === "director"
&&
userProperty
)

&&
<select
value={
propertyFilter
}
onChange={(e)=>
setPropertyFilter(
e.target.value
)
}
className="
input
col-span-2
"
>

<option>
All Properties
</option>

<option>
Mahas Elite
</option>

<option>
Mahas Vrindavan
</option>

</select>
}

</div>

<div className="
grid
grid-cols-2
gap-4
">

<div className="
border
rounded
p-4
bg-white
">

<h3 className="
font-bold
">
Revenue
</h3>

<p>

₹{
fmt(
data.revenue
)
}

</p>

</div>

<div className="
border
rounded
p-4
bg-white
">

<h3 className="
font-bold
">
Profit
</h3>

<p>

₹{
fmt(
data.profit
)
}

</p>

</div>

<div className="
border
rounded
p-4
bg-white
">

<h3 className="
font-bold
">
Payment Mode
</h3>

<div className="
space-y-1
text-sm
">

<p>
Bank :
₹{
fmt(
data.paymentSummary?.bank
||
0
)
}
</p>

<p>
Cash :
₹{
fmt(
data.paymentSummary?.cash
||
0
)
}
</p>

<p>
UPI :
₹{
fmt(
data.paymentSummary?.upi
||
0
)
}
</p>

<p>
Card :
₹{
fmt(
data.paymentSummary?.card
||
0
)
}
</p>

</div>
</div>

<div className="
border
rounded
p-4
bg-white
">

<h3 className="
font-bold
">
Expense Categories
</h3>

<div className="
space-y-1
text-sm
">

{
Object.entries(
data.categorySummary || {}
)
.map(
([cat,val]:any)=>(

<p
key={cat}
>

{cat}

:

₹{
fmt(
val
)
}

</p>

))
}

</div>

</div>

<div className="
border
rounded
p-4
bg-white
col-span-2
">

<h3 className="
font-bold
">
Source Performance
</h3>

<div className="
space-y-2
text-sm
">

{
Object.entries(
data.sourceSummary || {}
)
.map(
([src,v]:any)=>(

<div
key={src}
className="
border-b
pb-2
"
>

<p className="
font-bold
">

{src}

</p>

<p>
Revenue :

₹{
fmt(
v.gross
)
}
</p>

<p>
Commission :

₹{
fmt(
v.commission
)
}
</p>

<p>

Collected :

₹{
fmt(
v.collected
)
}

</p>

<p>
Outstanding :

₹{
fmt(
v.outstanding
)
}
</p>

</div>

))
}

</div>

</div>

</div>

</div>

);

}