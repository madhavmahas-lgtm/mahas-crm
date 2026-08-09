"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function OwnerDashboard(){

const [data,setData] = useState({

revenue:0,
expenses:0,
profit:0,
outstanding:0,

grossRevenue:0,
gstCollected:0,
commission:0,
commissionGst:0,
tds:0,
tcs:0,
settlementAmount:0,

receivedAmount:0,
collectionPercentage:0,

grossExpense:0,
gstInput:0,
netExpense:0,

gstPayment:0,
tdsPayment:0,
loanRepay:0,
nonOperatingTotal:0,

operatingExpense:0,
operatingProfit:0,

eliteRevenue:0,
eliteExpense:0,
eliteProfit:0,

vrindavanRevenue:0,
vrindavanExpense:0,
vrindavanProfit:0
});

const [userProperty,setUserProperty] =
useState("");

const [fromDate,setFromDate] =
useState("2026-04-01");

const [toDate,setToDate] =
useState(
new Date()
.toISOString()
.split("T")[0]
);

useEffect(()=>{

setUserProperty(
sessionStorage.getItem(
"finance_property"
) || ""
);

},[]);

useEffect(()=>{

fetchData();

},[
userProperty,
fromDate,
toDate
]);

const fetchData = async()=>{

let bookingQuery =
supabase
.from("bookings")

.select(
`
id,
property,
checkout_date,
gross_amount,
gst_amount,
net_amount,
commission_amount,
gst_on_commission,
tds,
tcs,
settlement_amount
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

if(
userProperty
){
bookingQuery =
bookingQuery.eq(
"property",
userProperty
);
}

const {
data:bookings
}
=
await bookingQuery;
console.log("BOOKINGS", bookings);

const bookingIds =

bookings?.map(
(b)=>b.id
)

||

[];

const {
data:payments
}
=
await supabase
.from("payments")
.select(
`
booking_id,
payment_amount
`
)
.in(
"booking_id",
bookingIds
);

let expenseQuery =
supabase
.from("expenses")
.select(
`
property,
date,
category,
gross_amount,
gst_amount,
net_amount,
elite_share,
vrindavan_share
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

const {
data:expenses
}
=
await expenseQuery;

console.log("EXPENSES", expenses);

let revenue = 0;
let totalExpenses = 0;

let grossRevenue = 0;
let gstCollected = 0;
let commission = 0;
let commissionGst = 0;
let tds = 0;
let tcs = 0;
let settlementAmount = 0;
let receivedAmount = 0;
let grossExpense = 0;
let gstInput = 0;
let netExpense = 0;
let gstPayment = 0;
let tdsPayment = 0;
let loanRepay = 0;
let eliteRevenue = 0;
let eliteExpense = 0;

let vrindavanRevenue = 0;
let vrindavanExpense = 0;

bookings?.forEach((b)=>{

grossRevenue +=
Number(
b.gross_amount || 0
);

gstCollected +=
Number(
b.gst_amount || 0
);

revenue +=
Number(
b.net_amount || 0
);

if(
b.property === "Mahas Elite"
){
eliteRevenue +=
Number(
b.net_amount || 0
);
}

if(
b.property === "Mahas Vrindavan"
){
vrindavanRevenue +=
Number(
b.net_amount || 0
);
}

commission +=
Number(
b.commission_amount || 0
);

commissionGst +=
Number(
b.gst_on_commission || 0
);

tds +=
Number(
b.tds || 0
);

tcs +=
Number(
b.tcs || 0
);

settlementAmount +=
Number(
b.settlement_amount || 0
);

});

payments?.forEach((p)=>{

receivedAmount +=
Number(
p.payment_amount || 0
);

});

expenses?.forEach((e)=>{

grossExpense +=
Number(
e.gross_amount || 0
);

gstInput +=
Number(
e.gst_amount || 0
);

netExpense +=
Number(
e.net_amount || 0
);

});

expenses?.forEach((e)=>{

const cat =
e.category || "";

if(
cat === "GST Payment"
){

gstPayment +=
Number(
e.net_amount || 0
);

}

if(
cat === "TDS Payment"
){

tdsPayment +=
Number(
e.net_amount || 0
);

}

if(
cat === "Loan Repay"
){

loanRepay +=
Number(
e.net_amount || 0
);

}

});

expenses?.forEach((e)=>{

const cat =
e.category || "";

const isOperatingExpense =

cat !== "GST Payment"

&&

cat !== "TDS Payment"

&&

cat !== "Loan Repay";

if(
!isOperatingExpense
){
return;
}

if(
e.property === "Mahas Elite"
){
eliteExpense +=
Number(
e.net_amount || 0
);
}

if(
e.property === "Mahas Vrindavan"
){
vrindavanExpense +=
Number(
e.net_amount || 0
);
}

if(
e.property === "Common"
){
eliteExpense +=
Number(
e.elite_share || 0
);

vrindavanExpense +=
Number(
e.vrindavan_share || 0
);
}

if(
userProperty ===
"Mahas Elite"
){

if(
e.property ===
"Mahas Elite"
){

totalExpenses +=
Number(
e.net_amount || 0
);

}

if(
e.property ===
"Common"
){

totalExpenses +=
Number(
e.elite_share || 0
);

}

}

else if(
userProperty ===
"Mahas Vrindavan"
){

if(
e.property ===
"Mahas Vrindavan"
){

totalExpenses +=
Number(
e.net_amount || 0
);

}

if(
e.property ===
"Common"
){

totalExpenses +=
Number(
e.vrindavan_share || 0
);

}

}

else{

if(
e.property ===
"Mahas Elite"
||
e.property ===
"Mahas Vrindavan"
||
e.property ===
"Common"
){

totalExpenses +=
Number(
e.net_amount || 0
);

}

}

});

console.log("Revenue", revenue);
console.log("Expenses", totalExpenses);
console.log({
grossRevenue,
gstCollected,
commission,
commissionGst,
tds,
tcs,
settlementAmount
});

const outstanding =

settlementAmount
-
receivedAmount;

const nonOperatingTotal =

gstPayment
+
tdsPayment
+
loanRepay;

const operatingExpense =

netExpense
-
nonOperatingTotal;

const operatingProfit =

revenue
-
operatingExpense;

const eliteProfit =

eliteRevenue
-
eliteExpense;

const vrindavanProfit =

vrindavanRevenue
-
vrindavanExpense;

const collectionPercentage =

settlementAmount > 0

?

(
receivedAmount
/
settlementAmount
)
*
100

:

0;

setData({

revenue,

expenses:
totalExpenses,

profit:
revenue
-
totalExpenses,

outstanding,

receivedAmount,
collectionPercentage,
grossRevenue,
gstCollected,
commission,
commissionGst,
tds,
tcs,
settlementAmount,

grossExpense,
gstInput,
netExpense,

gstPayment,
tdsPayment,
loanRepay,
nonOperatingTotal,

operatingExpense,
operatingProfit,

eliteRevenue,
eliteExpense,
eliteProfit,

vrindavanRevenue,
vrindavanExpense,
vrindavanProfit,

});

};

const fmt =
(v:number)=>
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

<div className="container p-4 space-y-6">

<h1 className="
text-2xl
font-bold
text-center
">

⭐ Owner Dashboard

</h1>

<div className="space-y-3">

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
rounded
p-2
w-full
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
rounded
p-2
w-full
"
/>

<div className="flex gap-2 flex-wrap">

<button
onClick={()=>{

const d = new Date();

setFromDate(
`${d.getFullYear()}-${String(
d.getMonth()+1
).padStart(2,"0")}-01`
);

setToDate(
new Date()
.toISOString()
.split("T")[0]
);

}}
className="
border
rounded
px-3
py-1
text-sm
"
>

This Month

</button>

<button
onClick={()=>{

const d = new Date();

const firstDayLastMonth =
new Date(
d.getFullYear(),
d.getMonth()-1,
1
);

const lastDayLastMonth =
new Date(
d.getFullYear(),
d.getMonth(),
0
);

setFromDate(
firstDayLastMonth
.toISOString()
.split("T")[0]
);

setToDate(
lastDayLastMonth
.toISOString()
.split("T")[0]
);

}}
className="
border
rounded
px-3
py-1
text-sm
"
>

Last Month

</button>

<button
onClick={()=>{

const d = new Date();

setFromDate(
`${d.getFullYear()}-04-01`
);

setToDate(
new Date()
.toISOString()
.split("T")[0]
);

}}
className="
border
rounded
px-3
py-1
text-sm
"
>

Financial Year

</button>

</div>

</div>

<div className="
border
rounded
p-4
space-y-2
">

<h2 className="
font-bold
text-lg
">
Booking Summary
</h2>

<div>
Gross Revenue :
₹ {fmt(data.grossRevenue)}
</div>

<div>
GST Collected :
₹ {fmt(data.gstCollected)}
</div>

<div>
Net Revenue :
₹ {fmt(data.revenue)}
</div>

<hr />

<div>
Commission :
₹ {fmt(data.commission)}
</div>

<div>
GST on Commission :
₹ {fmt(data.commissionGst)}
</div>

<div>
TDS :
₹ {fmt(data.tds)}
</div>

<div>
TCS :
₹ {fmt(data.tcs)}
</div>

<hr />

<div className="font-bold">
Settlement Amount :
₹ {fmt(data.settlementAmount)}
</div>

</div>

<div className="
border
rounded
p-4
space-y-2
">

<h2 className="
font-bold
text-lg
">
Collection Summary
</h2>

<div>
Expected Collection :
₹ {fmt(data.settlementAmount)}
</div>

<div>
Received :
₹ {fmt(data.receivedAmount)}
</div>

<div className="font-bold">
Outstanding :
₹ {fmt(data.outstanding)}
</div>

<hr />

<div>
Collection % :
{Number(
data.collectionPercentage || 0
).toFixed(2)}%
</div>

</div>

<div className="
border
rounded
p-4
space-y-2
">

<h2 className="
font-bold
text-lg
">
Expense Summary
</h2>

<div>
Gross Expense :
₹ {fmt(data.grossExpense)}
</div>

<div>
GST Input :
₹ {fmt(data.gstInput)}
</div>

<hr />

<div className="font-bold">
Net Expense :
₹ {fmt(data.netExpense)}
</div>

</div>

<div className="
border
rounded
p-4
space-y-2
">

<h2 className="
font-bold
text-lg
">
Non Operating Summary
</h2>

<div>
GST Payment :
₹ {fmt(data.gstPayment)}
</div>

<div>
TDS Payment :
₹ {fmt(data.tdsPayment)}
</div>

<div>
Loan Repay :
₹ {fmt(data.loanRepay)}
</div>

<hr />

<div className="font-bold">
Total Non Operating :
₹ {fmt(data.nonOperatingTotal)}
</div>

</div>

<div className="
border
rounded
p-4
space-y-2
">

<h2 className="
font-bold
text-lg
">
Business Result
</h2>

<div>
Net Revenue :
₹ {fmt(data.revenue)}
</div>

<div>
Operating Expense :
₹ {fmt(data.operatingExpense)}
</div>

<hr />

<div className="font-bold">
Operating Profit :
₹ {fmt(data.operatingProfit)}
</div>

</div>

<div className="
border
rounded
p-4
space-y-3
">

<h2 className="
font-bold
text-lg
">
Property Performance
</h2>

<div>

<div className="font-bold">
Mahas Elite
</div>

<div>
Revenue :
₹ {fmt(data.eliteRevenue)}
</div>

<div>
Expense :
₹ {fmt(data.eliteExpense)}
</div>

<div>
Profit :
₹ {fmt(data.eliteProfit)}
</div>

</div>

<hr />

<div>

<div className="font-bold">
Mahas Vrindavan
</div>

<div>
Revenue :
₹ {fmt(data.vrindavanRevenue)}
</div>

<div>
Expense :
₹ {fmt(data.vrindavanExpense)}
</div>

<div>
Profit :
₹ {fmt(data.vrindavanProfit)}
</div>

</div>

</div>

</div>
);

}