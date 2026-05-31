"use client";

import Link from "next/link";

export default function FinanceHome(){

const menu = [

{
title:"Bookings",

items:[

{
name:"Bookings",
url:"/finance/bookings"
},

{
name:"Booking Summary",
url:"/finance/bookings/summary"
}

]

},

{
title:"Expenses",

items:[

{
name:"Expenses List",
url:"/finance/expenses"
},

{
name:"Add Expense",
url:"/finance/expenses/add"
},

{
name:"Expense Summary",
url:"/finance/expenses/summary"
}

]

},

{
title:"Dashboards",

items:[

{
name:"Finance Dashboard",
url:"/finance/dashboard"
},

{
name:"Owner MIS",
url:"/finance/mis"
}

]

},

{
title:"Reports",

items:[

{
name:"Booking Verification",
url:"/finance/reports/booking-verification"
}

]

}


];

return(

<div className="
container
space-y-6
p-4
">

<h1 className="
text-2xl
font-bold
text-center
">

Mahas Finance Center

</h1>

{

menu.map(
(section)=>(

<div

key={
section.title
}

className="
border
rounded
p-4
bg-white
space-y-3
"

>

<h2 className="
font-bold
text-lg
">

{
section.title
}

</h2>

<div className="
grid
gap-2
">

{
section.items.map(
(item)=>(

<Link

key={
item.url
}

href={
item.url
}

className="
border
rounded
p-3
hover:bg-gray-100
"

>

{
item.name
}

</Link>

))
}

</div>

</div>

))

}

</div>

);

}