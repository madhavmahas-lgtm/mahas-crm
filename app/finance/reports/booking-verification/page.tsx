"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingVerificationPage(){

const [
property,
setProperty
] = useState("");

const [
startDate,
setStartDate
] = useState("");

const [
endDate,
setEndDate
] = useState("");

const [
status,
setStatus
] = useState("All");

const [
role,
setRole
] = useState("");

const [
userProperty,
setUserProperty
] = useState("");

const [
reportData,
setReportData
] = useState<any[]>([]);

const [
paymentsData,
setPaymentsData
] = useState<any[]>([]);

useEffect(()=>{

setRole(
sessionStorage.getItem(
"finance_role"
)
||""
);

setUserProperty(
sessionStorage.getItem(
"finance_property"
)
||""
);

},[]);

useEffect(()=>{

if(
userProperty
){

setProperty(
userProperty
);

}

},[
userProperty
]);

const generateReport =
async()=>{

if(
!property
){

alert(
"Select Property"
);

return;

}

const {
data,
error
}
=
await supabase

.from(
"bookings"
)

.select("*")

.eq(
"property",
property
)

.gte(
"checkout_date",
startDate
)

.lte(
"checkout_date",
endDate
)

.order(
"invoice_number",
{
ascending:true
}
);

if(
error
){

alert(
error.message
);

return;

}

const sortedData =
(data || []).sort(
(a,b)=>{

const aNum =
parseInt(
a.invoice_number
?.split("-")
?.pop() || "0"
);

const bNum =
parseInt(
b.invoice_number
?.split("-")
?.pop() || "0"
);

return aNum - bNum;

}
);

setReportData(
sortedData
);
const bookingIds =
(data || [])
.map(
(b)=>b.id
);

if(
bookingIds.length > 0
){

const {
data: payments
}
=
await supabase

.from(
"payments"
)

.select("*")

.in(
"booking_id",
bookingIds
);

setPaymentsData(
payments || []
);

}
else{

setPaymentsData([]);

}

};

const getBookingPayments =
(
bookingId:string
)=>{

return paymentsData.filter(
(payment)=>

payment.booking_id
=== bookingId

);

};

const reportSummary =
reportData.reduce(
(acc,booking)=>{

const bookingPayments =
getBookingPayments(
booking.id
);

const paid =
bookingPayments.reduce(
(sum,p)=>

sum +
Number(
p.payment_amount || 0
),

0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - paid;

if(
paid === 0
){

acc.noPaymentBookings += 1;

}
else if(
paid > gross
){

acc.overpaidBookings += 1;

}
else if(
balance === 0
){

acc.paidBookings += 1;

}
else{

acc.partialBookings += 1;

}

acc.bookings += 1;

acc.gross +=
Number(
booking.gross_amount || 0
);

acc.gst +=
Number(
booking.gst_amount || 0
);

acc.paid += paid;

return acc;

},

{
bookings:0,
gross:0,
gst:0,
paid:0,

paidBookings:0,
partialBookings:0,
noPaymentBookings:0,
overpaidBookings:0
}
);

const totalBalance =
reportSummary.gross -
reportSummary.paid;

return(

<div className="space-y-6">

<h1 className="
text-2xl
font-bold
">

Booking Verification Report

</h1>

<div className="
border
rounded
p-4
bg-white
space-y-4
">

<div>

<label className="block mb-1">
Property
</label>

<select

value={property}

disabled={

userProperty !== ""

}

onChange={(e)=>
setProperty(
e.target.value
)
}

className="
border
p-2
rounded
w-full
"
>

<option value="">
Select Property
</option>

<option>
Mahas Elite
</option>

<option>
Mahas Vrindavan
</option>

</select>

</div>

<div>

<label className="block mb-1">
Checkout Date From
</label>

<input

type="date"

value={startDate}

onChange={(e)=>
setStartDate(
e.target.value
)
}

className="
border
p-2
rounded
w-full
"

/>

</div>

<div>

<label className="block mb-1">
Checkout Date To
</label>

<input

type="date"

value={endDate}

onChange={(e)=>
setEndDate(
e.target.value
)
}

className="
border
p-2
rounded
w-full
"

/>

</div>

<div>

<label className="block mb-1">
Status
</label>

<select

value={status}

onChange={(e)=>
setStatus(
e.target.value
)
}

className="
border
p-2
rounded
w-full
"

>

<option>All</option>
<option>Paid</option>
<option>Partial</option>
<option>No Payment</option>
<option>Overpaid</option>

</select>

</div>

<button

onClick={
generateReport
}

className="
bg-black
text-white
px-4
py-2
rounded
"

>

Generate Report

</button>

</div>

{
reportData.length > 0
&&

<div className="
border
rounded
p-4
bg-green-50
">

<div className="
grid
grid-cols-4
gap-4
mb-6
p-4
bg-white
rounded
font-semibold
">

<div className="
bg-blue-50
p-3
rounded
">

Total Bookings

<br />

{
reportSummary.bookings
}

</div>

<div className="
bg-green-50
p-3
rounded
">

Paid Bookings

<br />

{
reportSummary.paidBookings
}

</div>

<div className="
bg-orange-50
p-3
rounded
">

Partial Bookings

<br />

{
reportSummary.partialBookings
}

</div>

<div className="
bg-red-50
p-3
rounded
">

No Payment Bookings

<br />

{
reportSummary.noPaymentBookings
}

</div>

<div className="
bg-green-50
p-3
rounded
">

Gross Revenue

<br />

₹{
reportSummary.gross
.toLocaleString()
}

</div>

<div className="
bg-yellow-50
p-3
rounded
">

GST Collected

<br />

₹{
reportSummary.gst
.toLocaleString()
}

</div>

<div className="
bg-emerald-50
p-3
rounded
">

Total Paid

<br />

₹{
reportSummary.paid
.toLocaleString()
}

</div>

<div className="
bg-red-50
p-3
rounded
">

Balance

<br />

₹{
totalBalance
.toLocaleString()
}

</div>


</div>


<div className="space-y-4 mt-4">

<div className="
grid
grid-cols-9
gap-2
font-bold
border-b
pb-2
mb-4
text-sm
">

<div>Invoice</div>
<div>Booking Date</div>
<div>Checkout Date</div>
<div>Net</div>
<div>GST</div>
<div>Gross</div>
<div>Paid</div>
<div>Balance</div>
<div>Status</div>

</div>
{



reportData.map(
(booking:any)=>{

const bookingPayments =
getBookingPayments(
booking.id
);

const paid =
bookingPayments.reduce(
(sum,p)=>

sum +
Number(
p.payment_amount || 0
),

0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - paid;

let statusText =
"PARTIAL";

if(
paid === 0
){

statusText =
"NO PAYMENT";

}
else if(
balance === 0
){

statusText =
"PAID";

}
else if(
paid > gross
){

statusText =
"OVERPAID";

}

const selectedStatus =
status.toUpperCase();

if(
status !== "All"
&&
statusText !== selectedStatus
){

return null;

}

return(

<div

key={booking.id}

className="
border
rounded
p-4
bg-white
"

>

<div className="
grid
grid-cols-9
gap-2
text-sm
mt-2
">

<div>
{booking.invoice_number}
</div>

<div>
{booking.booking_date}
</div>

<div>
{booking.checkout_date}
</div>

<div>
₹{Number(
booking.net_amount || 0
).toLocaleString()}
</div>

<div>
₹{Number(
booking.gst_amount || 0
).toLocaleString()}
</div>

<div>
₹{Number(
booking.gross_amount || 0
).toLocaleString()}
</div>

<div>
₹{paid.toLocaleString()}
</div>

<div>
₹{balance.toLocaleString()}
</div>

<div
className={

statusText === "PAID"
?

"text-green-600 font-semibold"

:

statusText === "PARTIAL"
?

"text-orange-600 font-semibold"

:

statusText === "NO PAYMENT"
?

"text-red-600 font-semibold"

:

"text-purple-600 font-semibold"

}
>

{statusText}

</div>

</div>
<div className="mt-3">

<b>
Payment Details :
</b>

</div>

{
bookingPayments.length > 0
?

bookingPayments.map(
(payment:any)=>(

<div

key={payment.id}

className="
ml-6
text-sm
"

>

{
payment.payment_date
}

{" | "}

{
payment.payment_mode
}

{" | ₹"}

{
Number(
payment.payment_amount || 0
).toLocaleString()
}

</div>

))

:

<div className="
ml-6
text-sm
text-red-500
">

No Payments Recorded

</div>

}

</div>

);

})

}

</div>

</div>

}

</div>
);

}