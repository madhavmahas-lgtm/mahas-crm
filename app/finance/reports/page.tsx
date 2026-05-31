"use client";

import Link from "next/link";

export default function ReportsPage() {

return (

<div className="space-y-6">

<h1 className="
text-2xl
font-bold
">
Reports
</h1>

<div className="
border
rounded
p-4
bg-white
space-y-3
">

<h2 className="
font-bold
text-lg
">
Verification Reports
</h2>

<Link

href="/finance/reports/booking-verification"

className="
block
border
rounded
p-3
hover:bg-gray-100
"

>

📋 Booking Verification

</Link>

</div>

</div>

);

}