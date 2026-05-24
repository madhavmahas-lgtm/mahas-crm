"use client";

import {
useState
}
from "react";

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
₹0.00
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
₹0.00
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

<p>
Bank / Cash / UPI
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
Expense Categories
</h3>

<p>
Rent / Salary / Misc
</p>

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

<p>
Direct / MMT / Agoda
</p>

</div>

</div>

</div>

);

}