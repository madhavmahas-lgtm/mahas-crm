"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [data, setData] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,

    eliteSales: 0,
    eliteExpenses: 0,

    vrindavanSales: 0,
    vrindavanExpenses: 0,

    commonExpenses:0,

    eliteCommonShare:0,

    vrindavanCommonShare:0,
    paymentSummary:{
    bank:0,
    cash:0,
    upi:0,
    card:0
    },

  });

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

const [filters,setFilters] =
useState({

from:
`${currentMonth}-01`,

to:
nextMonth
.toISOString()
.split("T")[0]

});


const fetchData = async () => {
  // BOOKINGS QUERY
  let bookingQuery = supabase
    .from("bookings")
    .select(
    "property, gross_amount, checkout_date"
    )

  if (filters.from) {
    bookingQuery = bookingQuery.gte("checkout_date",filters.from);
  }
  if (filters.to) {
    bookingQuery = bookingQuery.lte("checkout_date",filters.to);
  }

  const { data: bookings } = await bookingQuery;

  // EXPENSES QUERY
  let expenseQuery = supabase
  .from("expenses")
  .select(
  `
  property,
  gross_amount,
  net_amount,
  date,
  payment_mode
  `
  );

  if (filters.from) {
    expenseQuery = expenseQuery.gte("date", filters.from);
  }
  if (filters.to) {
    expenseQuery = expenseQuery.lte("date", filters.to);
  }

  const { data: expenses } = await expenseQuery;

  let totalSales = 0;
  let totalExpenses = 0;

  let eliteSales = 0;
  let vrindavanSales = 0;

  let eliteExpenses = 0;
  let vrindavanExpenses = 0;

  let commonExpenses = 0;

  let eliteCommonShare = 0;
  let vrindavanCommonShare = 0;

  let paymentSummary = {

  bank:0,
  cash:0,
  upi:0,
  card:0

  };

  // SALES
  bookings?.forEach((b) => {
    const amt = Number(b.gross_amount || 0);
    totalSales += amt;

    if (b.property === "Mahas Elite") eliteSales += amt;
    if (b.property === "Mahas Vrindavan") vrindavanSales += amt;
  });

  // EXPENSES
  expenses?.forEach((e) => {
  const amt = Number(e.gross_amount || e.net_amount || 0 );  

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

paymentSummary.bank += amt;

}

else if(
mode.includes(
"cash"
)
){

paymentSummary.cash += amt;

}

else if(
mode.includes(
"upi"
)
){

paymentSummary.upi += amt;

}

else if(
mode.includes(
"card"
)
){

paymentSummary.card += amt;

}

    totalExpenses += amt;

    if (e.property === "Mahas Elite") {
      eliteExpenses += amt;
    } else if (e.property === "Mahas Vrindavan") {
      vrindavanExpenses += amt;
    } 
      else if (
e.property ===
"Common"
){

commonExpenses += amt;

eliteCommonShare +=
amt / 3;

vrindavanCommonShare +=
(amt * 2) / 3;

eliteExpenses +=
amt / 3;

vrindavanExpenses +=
(amt * 2) / 3;

}
  });

  setData({
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses,

    eliteSales,
    eliteExpenses,

    vrindavanSales,
    vrindavanExpenses,

    commonExpenses,

    eliteCommonShare,

    vrindavanCommonShare,

    paymentSummary,
  });
};

    useEffect(() => {
      fetchData();
    }, [filters]);

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

  return (
    <div className="container space-y-4">
      <h2 className="text-xl font-bold text-center">Finance Dashboard</h2>

  <div className="flex gap-2 flex-wrap">
    <input
      type="date"
      value={filters.from}
      onChange={(e) =>
        setFilters({ ...filters, from: e.target.value })
      }
      className="input"
    />

    <input
      type="date"
      value={filters.to}
      onChange={(e) =>
        setFilters({ ...filters, to: e.target.value })
      }
      className="input"
    />

    
  </div>

<table className="
w-full
border
text-sm
">

<thead>

<tr className="
border-b
bg-gray-100
font-bold
">

<th className="p-2">
Property
</th>

<th className="
p-2
text-right
">
Revenue
</th>

<th className="
p-2
text-right
">
Expenses
</th>

<th className="
p-2
text-right
">
Common Share
</th>

<th className="
p-2
text-right
">
Profit
</th>
</tr>

</thead>

<tbody>

<tr className="border-b">

<td className="p-2">
All Properties
</td>

<td className="
p-2
text-right
">
₹{
fmt(
data.totalSales
)
}
</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.totalExpenses
)
}

</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.commonExpenses
)
}

</td>
<td className="
p-2
text-right
font-bold
">

₹{
fmt(
data.profit
)
}

</td>

</tr>

<tr className="border-b">

<td className="p-2">
Mahas Elite
</td>

<td className="
p-2
text-right
">
₹{
fmt(
data.eliteSales
)
}

</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.eliteExpenses
)
}

</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.eliteCommonShare
)
}

</td>
<td className="
p-2
text-right
">

₹{
fmt(
data.eliteSales
-
data.eliteExpenses
)
}

</td>

</tr>

<tr>

<td className="p-2">
Mahas Vrindavan
</td>

<td className="
p-2
text-right
">
₹{
fmt(
data.vrindavanSales
)
}

</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.vrindavanExpenses
)
}

</td>

<td className="
p-2
text-right
">

₹{
fmt(
data.vrindavanCommonShare
)
}

</td>
<td className="
p-2
text-right
">

₹{
fmt(
data.vrindavanSales
-
data.vrindavanExpenses
)
}

</td>

</tr>

</tbody>

</table>

<div className="
border
rounded
mt-6
p-4
">

<h3 className="
font-bold
mb-3
">
Payment Mode Analysis
</h3>

<table className="
w-full
text-sm
">

<tbody>

<tr>

<td>
Bank Transfer
</td>

<td className="
text-right
">
₹{
fmt(
data.paymentSummary
?.bank
)
}
</td>

</tr>

<tr>

<td>
Cash
</td>

<td className="
text-right
">
₹{
fmt(
data.paymentSummary
?.cash
)
}
</td>

</tr>

<tr>

<td>
UPI
</td>

<td className="
text-right
">
₹{
fmt(
data.paymentSummary
?.upi
)
}
</td>

</tr>

<tr>

<td>
Card
</td>

<td className="
text-right
">
₹{
fmt(
data.paymentSummary
?.card
)
}
</td>

</tr>

<tr className="
font-bold
border-t
">

<td>
TOTAL
</td>

<td className="
text-right
">

₹{
fmt(
(
data.paymentSummary?.bank ||0
)
+
(
data.paymentSummary?.cash ||0
)
+
(
data.paymentSummary?.upi ||0
)
+
(
data.paymentSummary?.card ||0
)
)
}

</td>

</tr>

</tbody>

</table>

</div>

</div>  );
}