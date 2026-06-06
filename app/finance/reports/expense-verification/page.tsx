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

const allowedProperties = () => {

if (
role === "admin"
) {
return [
"All",
"Mahas Elite",
"Mahas Vrindavan",
"Common"
];
}

if (
role === "director" &&
!userProperty
) {
return [
"All",
"Mahas Elite",
"Mahas Vrindavan",
"Common"
];
}

if (
userProperty === "Mahas Elite"
) {
return [
"Mahas Elite",
"Common"
];
}

if (
userProperty === "Mahas Vrindavan"
) {
return [
"Mahas Vrindavan",
"Common"
];
}

return ["Common"];

};

const [
reportData,
setReportData
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
else{

setProperty(
"All"
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

let query =

supabase

.from(
"expenses"
)

.select("*")

.gte(
"date",
startDate
)

.lte(
"date",
endDate
);

if(
property !== "All"
){
query =
query.eq(
"property",
property
);
}

const {
data,
error
}
=
await query.order(
"date",
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

setReportData(
data || []
);

};

const reportSummary =
reportData.reduce(
(acc:any,expense:any)=>{

acc.totalExpenses += 1;

acc.net += Number(
expense.net_amount || 0
);

acc.gst += Number(
expense.gst_amount || 0
);

acc.gross += Number(
expense.gross_amount || 0
);

if(
!expense.supplier_invoice
){
acc.missingInvoices += 1;
}

if(
!expense.supplier_gst
){
acc.missingGST += 1;
}

if(
expense.supplier_invoice
&&
expense.supplier_gst
){
acc.completeExpenses += 1;
}

if(
expense.payment_mode === "Cash"
){
acc.cashExpenses += 1;
}

if(
expense.payment_mode === "UPI"
){
acc.upiExpenses += 1;
}

return acc;

},
{
totalExpenses:0,

completeExpenses:0,

net:0,
gst:0,
gross:0,

missingInvoices:0,
missingGST:0,

cashExpenses:0,
upiExpenses:0
}
);


const exportPdf = ()=>{

const doc =
new jsPDF();

doc.setFontSize(16);

doc.text(
"Expense Verification Report",
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
`Total Expenses : ${reportSummary.totalExpenses}`,
14,
66
);

doc.text(
`Complete Expenses : ${reportSummary.completeExpenses}`,
14,
74
);

doc.text(
`Missing Invoices : ${reportSummary.missingInvoices}`,
14,
82
);

doc.text(
`Missing GST : ${reportSummary.missingGST}`,
14,
90
);

doc.text(
`Net Amount : Rs.${reportSummary.net.toLocaleString()}`,
110,
66
);

doc.text(
`GST Amount : Rs.${reportSummary.gst.toLocaleString()}`,
110,
74
);

doc.text(
`Gross Amount : Rs.${reportSummary.gross.toLocaleString()}`,
110,
82
);

let currentY = 105;



doc.setFontSize(9);

doc.text(
"Date",
14,
currentY
);

doc.text(
"Category",
48,
currentY
);

doc.text(
"Paid To",
75,
currentY
);

doc.text(
"Gross",
105,
currentY
);

doc.text(
"Mode",
130,
currentY
);

doc.text(
"Status",
155,
currentY
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

reportData

.filter(
(booking:any)=>{

let statusText =
"COMPLETE";

if(
!booking.supplier_invoice
&&
!booking.supplier_gst
){
statusText =
"INCOMPLETE";
}
else if(
!booking.supplier_invoice
){
statusText =
"MISSING INVOICE";
}
else if(
!booking.supplier_gst
){
statusText =
"MISSING GST";
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

let statusText =
"COMPLETE";

if(
!booking.supplier_invoice
&&
!booking.supplier_gst
){
statusText =
"INCOMPLETE";
}
else if(
!booking.supplier_invoice
){
statusText =
"MISSING INVOICE";
}
else if(
!booking.supplier_gst
){
statusText =
"MISSING GST";
}

if(
currentY > 260
){

doc.addPage();

currentY = 20;

}

doc.text(
String(booking.date || ""),
14,
currentY
);

doc.text(
String(booking.category || ""),
48,
currentY
);

doc.text(
String(booking.paid_to || ""),
75,
currentY
);

doc.text(
String(
Number(
booking.gross_amount || 0
).toLocaleString()
),
105,
currentY
);

doc.text(
String(
booking.payment_mode || "-"
),
130,
currentY
);

doc.text(
statusText,
155,
currentY
);


currentY += 6;

if(
booking.supplier_gst
){

doc.text(
`GST No : ${booking.supplier_gst}`,
20,
currentY
);

currentY += 5;

}

if(
booking.notes
){

doc.text(
`Notes : ${booking.notes}`,
20,
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

currentY += 6;

}
);

doc.save(
`ExpenseVerification-${property}.pdf`
);
};

const exportExcel = () => {

const excelData:any[] = [];

reportData

.filter(
(booking:any)=>{


let statusText =
"COMPLETE";

if(
!booking.supplier_invoice
&&
!booking.supplier_gst
){
statusText =
"INCOMPLETE";
}
else if(
!booking.supplier_invoice
){
statusText =
"MISSING INVOICE";
}
else if(
!booking.supplier_gst
){
statusText =
"MISSING GST";
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
(expense:any)=>{

let statusText =
"COMPLETE";

if(
!expense.supplier_invoice
&&
!expense.supplier_gst
){
statusText =
"INCOMPLETE";
}
else if(
!expense.supplier_invoice
){
statusText =
"MISSING INVOICE";
}
else if(
!expense.supplier_gst
){
statusText =
"MISSING GST";
}

excelData.push({

"Date":
expense.date,

"Property":
expense.property,

"Category":
expense.category,

"Paid To":
expense.paid_to,

"Payment Mode":
expense.payment_mode,

"Net Amount":
expense.net_amount,

"GST Amount":
expense.gst_amount,

"Gross Amount":
expense.gross_amount,

"Elite Share":
expense.elite_share,

"Vrindavan Share":
expense.vrindavan_share,

"Invoice No":
expense.supplier_invoice,

"GST No":
expense.supplier_gst,

"Status":
statusText,

"Notes":
expense.notes

});

});

const worksheet =
XLSX.utils.json_to_sheet(
excelData
);

worksheet["!autofilter"] = {
ref: "A1:N1"
};

worksheet["!cols"] = [

{ wch: 12 }, // Date
{ wch: 15 }, // Property
{ wch: 20 }, // Category
{ wch: 25 }, // Paid To
{ wch: 15 }, // Mode
{ wch: 15 }, // Net
{ wch: 15 }, // GST
{ wch: 15 }, // Gross

{ wch: 15 }, // Elite Share
{ wch: 18 }, // Vrindavan Share

{ wch: 20 }, // Invoice
{ wch: 20 }, // GST No
{ wch: 18 }, // Status
{ wch: 40 }  // Notes

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
Metric:"Total Expenses",
Value:reportSummary.totalExpenses
},

{
Metric:"Complete Expenses",
Value:reportSummary.completeExpenses
},

{
Metric:"Missing Invoices",
Value:reportSummary.missingInvoices
},

{
Metric:"Missing GST",
Value:reportSummary.missingGST
},

{},

{
Metric:"Net Amount",
Value:reportSummary.net
},

{
Metric:"GST Amount",
Value:reportSummary.gst
},

{
Metric:"Gross Amount",
Value:reportSummary.gross
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
"Expense Verification"
);

XLSX.writeFile(
workbook,
`ExpenseVerification-${property}.xlsx`
);

};

return(

<div className="space-y-6">

<h1 className="
text-2xl
font-bold
">

Expense Verification Report

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

role === "viewer"

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

{
allowedProperties().map(
(prop)=>(
<option
key={prop}
value={prop}
>
{prop}
</option>
)
)
}
</select>

</div>

<div>

<label className="block mb-1">
Expense Date From
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
Expense Date To
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
Verification Status
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
<option>Complete</option>
<option>Missing Invoice</option>
<option>Missing GST</option>
<option>Incomplete</option>

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

Total Expenses

<br />

{
reportSummary.totalExpenses
}

</div>

<div className="
bg-green-50
p-3
rounded
">

Missing Invoices

<br />

{
reportSummary.missingInvoices
}

</div>

<div className="
bg-orange-50
p-3
rounded
">

Missing GST

<br />

{
reportSummary.missingGST
}

</div>

<div className="
bg-red-50
p-3
rounded
">

Complete Expenses

<br />

{
reportSummary.completeExpenses
}

</div>

<div className="
bg-green-50
p-3
rounded
">

UPI Expenses

<br />

{
reportSummary.upiExpenses
}

</div>

<div className="
bg-yellow-50
p-3
rounded
">

Net Amount

<br />

₹{
reportSummary.net
.toLocaleString()
}

</div>

<div className="
bg-emerald-50
p-3
rounded
">

GST Amount

<br />

₹{
reportSummary.gst
.toLocaleString()
}

</div>

<div className="
bg-red-50
p-3
rounded
">

Gross Amount

<br />

₹{
reportSummary.gross
.toLocaleString()
}

</div>


</div>


<div className="space-y-4 mt-4">

<div className="
grid
grid-cols-11
gap-2
font-bold
border-b
pb-2
mb-4
text-sm
">

<div>Date</div>
<div>Category</div>
<div>Paid To</div>
<div>Net</div>
<div>GST</div>
<div>Gross</div>
<div>Elite Share</div>
<div>Vrindavan Share</div>
<div>Invoice</div>
<div>GST No</div>
<div>Status</div>

</div>
{



reportData.map(
(booking:any)=>{

let statusText =
"COMPLETE";

if(
!booking.supplier_invoice
&&
!booking.supplier_gst
){
statusText =
"INCOMPLETE";
}
else if(
!booking.supplier_invoice
){
statusText =
"MISSING INVOICE";
}
else if(
!booking.supplier_gst
){
statusText =
"MISSING GST";
}

const selectedStatus =
status.toUpperCase().replace(" ", "_");

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
grid-cols-11
gap-2
text-sm
mt-2
">

<div>
{booking.date}
</div>

<div>
{booking.category}
</div>

<div>
{booking.paid_to}
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
₹{
Number(
booking.elite_share || 0
).toLocaleString()
}
</div>

<div>
₹{
Number(
booking.vrindavan_share || 0
).toLocaleString()
}
</div>

<div>
{booking.supplier_invoice || "-"}
</div>

<div>
{booking.supplier_gst || "-"}
</div>

<div
className={

statusText === "COMPLETE"
?

"text-green-600 font-semibold"

:

statusText === "MISSING INVOICE"
?

"text-orange-600 font-semibold"

:

statusText === "MISSING GST"
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
Notes :
</b>

<span className="ml-2">

{
booking.notes || "-"
}

</span>

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