"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import * as XLSX from "xlsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const getBookingVerificationDetails = (booking:any) => {
  const bookingPayments = getBookingPayments(booking.id);

  const paid = bookingPayments.reduce(
    (sum, p) => sum + Number(p.payment_amount || 0),
    0
  );

  const settledAmount =
    paid +
    Number(booking.commission_amount || 0) +
    Number(booking.gst_on_commission || 0) +
    Number(booking.tds || 0) +
    Number(booking.tcs || 0);

  const gross = Number(booking.gross_amount || 0);
  const gst = Number(booking.gst_amount || 0);
  const net = gross - gst;
  const balance = gross - settledAmount;

  let statusText = "PARTIAL";

  if (paid === 0) {
    statusText = "NO PAYMENT";
  } else if (paid > gross) {
    statusText = "OVERPAID";
  } else if (balance === 0) {
    statusText = "PAID";
  }

  return {
    bookingPayments,
    paid,
    settledAmount,
    gross,
    gst,
    net,
    balance,
    statusText,
  };
};

const filteredReportData = reportData.filter((booking:any) => {
  const { statusText } = getBookingVerificationDetails(booking);

  if (status === "All") {
    return true;
  }

  return statusText === status.toUpperCase();
});
const reportSummary =
filteredReportData.reduce(
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - settledAmount;

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
filteredReportData.reduce(
(sum,booking)=>{

const bookingPayments =
getBookingPayments(
booking.id
);

const paid =
bookingPayments.reduce(
(total,p)=>
total +
Number(
p.payment_amount || 0
),
0
);

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

return sum + (
gross - settledAmount
);

},
0
);

const exportPdf = ()=>{

const doc =
new jsPDF();

doc.setFontSize(16);

doc.text(
"Booking Verification Report",
14,
15
);

doc.setFontSize(10);

doc.text(
`Property : ${property}`,
14,
25
);

doc.text(
`From : ${startDate}`,
14,
32
);

doc.text(
`To : ${endDate}`,
14,
39
);

doc.text(
`Status : ${status}`,
14,
46
);

doc.text(
"SUMMARY",
14,
58
);

doc.text(
`Total Bookings : ${reportSummary.bookings}`,
14,
66
);

doc.text(
`Paid Bookings : ${reportSummary.paidBookings}`,
14,
74
);

doc.text(
`Partial Bookings : ${reportSummary.partialBookings}`,
14,
82
);

doc.text(
`No Payment Bookings : ${reportSummary.noPaymentBookings}`,
14,
90
);

doc.text(
`Gross Revenue : ${reportSummary.gross.toLocaleString()}`,
110,
66
);

doc.text(
`Total Paid : ${reportSummary.paid.toLocaleString()}`,
110,
74
);

doc.text(
`Balance : ${totalBalance.toLocaleString()}`,
110,
82
);

let currentY = 105;



doc.setFontSize(9);

doc.text(
"Invoice",
14,
currentY
);

doc.text(
"Booking",
48,
currentY
);

doc.text(
"Checkout",
75,
currentY
);

doc.text(
"Gross",
105,
currentY
);

doc.text(
"Paid",
130,
currentY
);

doc.text(
"Balance",
155,
currentY
);

doc.text(
"Status",
190,
currentY,
{
align:"right"
}
);

currentY += 6;

doc.line(
14,
currentY,
195,
currentY
);

currentY += 6;

doc.setFontSize(9);

filteredReportData
.filter(
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const balance =
gross - settledAmount;

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

if(
status !== "All"
&&
statusText !== status.toUpperCase()
){
return false;
}

return true;

})

.forEach(
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - settledAmount;

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

if(
currentY > 260
){

doc.addPage();

currentY = 20;

}

doc.text(
booking.invoice_number,
14,
currentY
);

doc.text(
booking.booking_date || "",
48,
currentY
);

doc.text(
booking.checkout_date || "",
75,
currentY
);

doc.text(
gross.toLocaleString(),
105,
currentY
);

doc.text(
paid.toLocaleString(),
130,
currentY
);

doc.text(
balance.toLocaleString(),
155,
currentY
);

doc.text(
statusText,
185,
currentY,
{
align:"right"
}
);

currentY += 6;

if(
bookingPayments.length > 0
){

doc.text(
"Payments:",
20,
currentY
);

currentY += 5;

bookingPayments.forEach(
(payment:any)=>{

if(
currentY > 280
){

doc.addPage();

currentY = 20;

}

doc.text(

`${payment.payment_date} | ${payment.payment_mode} | Rs.${Number(
payment.payment_amount || 0
).toLocaleString()}`,

25,

currentY

);

currentY += 5;

}
);

}
else{

doc.text(
"No Payments Recorded",
25,
currentY
);

currentY += 5;

}

doc.line(
14,
currentY,
195,
currentY
);

currentY += 12;

}
);

doc.save(
`BookingVerification-${property}.pdf`
);
};

const exportExcel = () => {

const excelData:any[] = [];

filteredReportData
.filter(
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - settledAmount;

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

if(
status !== "All"
&&
statusText !== status.toUpperCase()
){
return false;
}

return true;

})

.forEach(
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - settledAmount;

const accountingNet =
gross -
Number(
booking.gst_amount || 0
);

const gst =
Number(
booking.gst_amount || 0
);

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

if(
bookingPayments.length === 0
){

excelData.push({

"Invoice No":
booking.invoice_number,

"Guest Name":
booking.guest_name,

"Booking Date":
booking.booking_date,

"Checkout Date":
booking.checkout_date,

"Net Amount":
accountingNet,

"GST Amount":
gst,

"Gross Amount":
gross,

"Paid Amount":
paid,

"Balance":
balance,

"Status":
statusText,

"Payment Date":
"",

"Payment Mode":
"",

"Payment Amount":
""

});

}
else{

bookingPayments.forEach(
(payment:any)=>{

excelData.push({

"Invoice No":
booking.invoice_number,

"Guest Name":
booking.guest_name,

"Booking Date":
booking.booking_date,

"Checkout Date":
booking.checkout_date,


"Net Amount":
accountingNet,

"GST Amount":
gst,

"Gross Amount":
gross,

"Paid Amount":
paid,

"Balance":
balance,

"Status":
statusText,

"Payment Date":
payment.payment_date,

"Payment Mode":
payment.payment_mode,

"Payment Amount":
payment.payment_amount

});

});

}

});

const worksheet =
XLSX.utils.json_to_sheet(
excelData
);

worksheet["!autofilter"] = {
ref: "A1:M1"
};

worksheet["!cols"] = [

{ wch: 18 }, // Invoice

{ wch: 30 }, // Guest Name

{ wch: 15 }, // Booking Date

{ wch: 15 }, // Checkout Date

{ wch: 15 }, // Net Amount

{ wch: 15 }, // GST Amount

{ wch: 15 }, // Gross

{ wch: 15 }, // Paid

{ wch: 15 }, // Balance

{ wch: 15 }, // Status

{ wch: 15 }, // Payment Date

{ wch: 15 }, // Payment Mode

{ wch: 18 }  // Payment Amount

];

const workbook =
XLSX.utils.book_new();

const summaryData = [

{
Metric:"Property",
Value:property
},

{
Metric:"From Date",
Value:startDate
},

{
Metric:"To Date",
Value:endDate
},

{
Metric:"Status",
Value:status
},

{},

{
Metric:"Total Bookings",
Value:reportSummary.bookings
},

{
Metric:"Paid Bookings",
Value:reportSummary.paidBookings
},

{
Metric:"Partial Bookings",
Value:reportSummary.partialBookings
},

{
Metric:"No Payment Bookings",
Value:reportSummary.noPaymentBookings
},

{},

{
Metric:"Gross Revenue",
Value:reportSummary.gross
},

{
Metric:"Total Paid",
Value:reportSummary.paid
},

{
Metric:"Balance",
Value:totalBalance
}

];

const summarySheet =
XLSX.utils.json_to_sheet(
summaryData
);

summarySheet["!cols"] = [

{ wch: 25 },

{ wch: 25 }

];

XLSX.utils.book_append_sheet(
workbook,
summarySheet,
"Summary"
);

XLSX.utils.book_append_sheet(
workbook,
worksheet,
"Booking Verification"
);

XLSX.writeFile(
workbook,
`BookingVerification-${property}.xlsx`
);

};

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

<button

onClick={
exportPdf
}

className="
bg-red-600
text-white
px-4
py-2
rounded
ml-2
"

>

Export PDF

</button>

<button

onClick={
exportExcel
}

className="
bg-green-600
text-white
px-4
py-2
rounded
ml-2
"

>

Export Excel

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
grid-cols-10
gap-2
font-bold
border-b
pb-2
mb-4
text-sm
">

<div>Invoice</div>
<div>Guest Name</div>
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

const settledAmount =

paid

+

Number(
booking.commission_amount || 0
)

+

Number(
booking.gst_on_commission || 0
)

+

Number(
booking.tds || 0
)

+

Number(
booking.tcs || 0
);

const gross =
Number(
booking.gross_amount || 0
);

const balance =
gross - settledAmount;

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
grid-cols-10
gap-2
text-sm
mt-2
">

<div>
{booking.invoice_number}
</div>

<div>
{booking.guest_name}
</div>

<div>
{booking.booking_date}
</div>

<div>
{booking.checkout_date}
</div>

<div>
₹{
(
Number(booking.gross_amount || 0)
-
Number(booking.gst_amount || 0)
).toLocaleString(
"en-IN",
{
minimumFractionDigits:2,
maximumFractionDigits:2
}
)
}
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

<div className="mt-3 text-sm">

<b>
Payment Details :
</b>

{
bookingPayments.length > 0
?

bookingPayments.map(
(payment:any,index:number)=>(

<div
key={payment.id}
className={
index === 0
?
"inline ml-2"
:
"ml-28"
}
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

<span className="
ml-2
text-red-500
">

No Payments Recorded

</span>

}

</div>

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