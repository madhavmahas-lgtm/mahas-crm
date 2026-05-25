"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [paymentTotals, setPaymentTotals] = useState<any>({});

  const [summary, setSummary] =
  useState({

  grossAmount:0,
  commission:0,
  gstCommission:0,
  tds:0,
  tcs:0,
  cardCharges:0,
  collected:0,
  outstanding:0,

  });

  const [sourceSummary,setSourceSummary] = useState<any>({});

  const [propertyFilter, setPropertyFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const router = useRouter();
  const [role, setRole] = useState("");

  const fetchBookings = async () => {
    let query = supabase
  .from("bookings")
  .select("*")
  .order("checkout_date", { ascending: false });

// DEFAULT = CURRENT MONTH

const currentMonth =
  new Date()
    .toISOString()
    .slice(0,7);

const startDate =
  `${currentMonth}-01`;

const nextMonth =
  new Date(
    currentMonth + "-01"
  );

nextMonth.setMonth(
  nextMonth.getMonth() + 1
);

const endDate =
  nextMonth
    .toISOString()
    .split("T")[0];

if (
  !fromDate &&
  !toDate &&
  !invoiceFilter &&
  !nameFilter &&
  !sourceFilter
) {
  query = query
    .gte(
      "checkout_date",
      startDate
    )
    .lt(
      "checkout_date",
      endDate
    );
}
    // PROPERTY FILTER
    if (propertyFilter) {
      query = query.eq("property", propertyFilter);
    }

    // SOURCE FILTER
    if (sourceFilter) {
      query = query.eq(
        "source_type",
        sourceFilter
      );
    }

// DATE RANGE FILTER

if (fromDate) {

query =
query.gte(
"checkout_date",
fromDate
);

}

if (toDate) {

query =
query.lte(
"checkout_date",
toDate
);

}

    // INVOICE FILTER
    if (invoiceFilter) {
  query = query.ilike(
    "invoice_number",
    `%${invoiceFilter}%`
  );
}

    // NAME FILTER
    if (nameFilter) {
  query = query.ilike(
    "guest_name",
    `%${nameFilter}%`
  );
}

    const { data, error } = await query;

    if (!error) {

      setBookings(data || []);

      const ids =
      (data || []).map(
      (b)=>b.id
      );

      if (
      ids.length === 0
      ) {

setPaymentTotals({});

setSummary({

grossAmount:0,
commission:0,
gstCommission:0,
tds:0,
tcs:0,
cardCharges:0,
collected:0,
outstanding:0,

});

return;

}

        {

        const {
          data: payments
        } = await supabase
          .from("payments")
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

        const totals:any = {};

        payments?.forEach((p) => {

          totals[p.booking_id] =
          (
            totals[
              p.booking_id
            ] || 0
          )
          +
          Number(
            p.payment_amount || 0
          );

         });

        setPaymentTotals(
          totals
        );

let grossAmount = 0;
let netAmount = 0;
let commission = 0;
let gstCommission = 0;
let tds = 0;
let tcs = 0;

(data || []).forEach((b)=>{

grossAmount +=
Number(
b.gross_amount || 0
);

netAmount +=
Number(
b.net_amount || 0
);

commission +=
Number(
b.commission_amount || 0
);

gstCommission +=
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

});

let collected = 0;
let cardCharges = 0;

payments?.forEach((p)=>{

collected +=
Number(
p.payment_amount || 0
);

cardCharges +=
Number(
p.card_charges || 0
);

});

setSummary({

grossAmount,

commission,

gstCommission,

tds,

tcs,

cardCharges,

collected,

outstanding:
netAmount
-
collected,

});

const sourceTotals:any = {};

(data || []).forEach((b)=>{

const src =
b.source_type ||
"Unknown";

if(
!sourceTotals[src]
){

sourceTotals[src] = {

bookings:0,
commission:0,
gstComm:0,
tds:0,
tcs:0,
net:0,
collected:0,

};

}

sourceTotals[src]
.bookings +=
Number(
b.gross_amount || 0
);

sourceTotals[src]
.commission +=
Number(
b.commission_amount || 0
);

sourceTotals[src]
.gstComm +=
Number(
b.gst_on_commission || 0
);

sourceTotals[src]
.tds +=
Number(
b.tds || 0
);

sourceTotals[src]
.tcs +=
Number(
b.tcs || 0
);

sourceTotals[src]
.net +=
Number(
b.net_amount || 0
);

});


payments?.forEach((p)=>{

const booking =
(data || [])
.find(
(b)=>
b.id ===
p.booking_id
);

if(
booking
){

const src =
booking.source_type ||
"Unknown";

sourceTotals[src]
.collected +=
Number(
p.payment_amount || 0
);

}

});


Object.keys(
sourceTotals
).forEach((s)=>{

sourceTotals[s]
.outstanding =

sourceTotals[s]
.net

-

sourceTotals[s]
.collected;

});


setSourceSummary(
sourceTotals
);

      }

    }

  };

useEffect(()=>{

setRole(
sessionStorage.getItem(
"finance_role"
)
||""

);

},[]);


  useEffect(() => {
    fetchBookings();
  }, [
    propertyFilter,
    sourceFilter,
    fromDate,
    toDate,
    invoiceFilter,
    nameFilter,
  ]);


  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this booking?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchBookings(); // refresh list
    }
  };


  return (
    <div className="container space-y-4">

    <div className="flex justify-between items-center">

    <h2 className="text-xl font-bold">
    Bookings
    </h2>

    <div className="flex gap-2">

    <button
    onClick={() => {
    setPropertyFilter("");
    setSourceFilter("");
    setFromDate("");
    setToDate("");
    setInvoiceFilter("");
    setNameFilter("");
    }}
    className="border px-3 py-1 rounded text-sm"
    >
    Clear
    </button>

    {
    role !== "viewer"

    &&

    <button
    onClick={() =>
    router.push(
    "/finance/bookings/add"
    )
    }
    className="
    bg-black
    text-white
    px-3
    py-1
    rounded
    "
    >

    + Add

    </button>

    }

    </div>

    </div>

<div
className="
border
rounded-lg
p-3
bg-white
shadow-sm
space-y-3
"
>

<p className="
font-bold
text-lg
text-blue-700
border-b
pb-2
mb-2
">

{
propertyFilter
?

propertyFilter

:

"All Properties"

}

</p>

<div
className="
grid
grid-cols-2
md:grid-cols-4
gap-3
"
>

<div>
<p className="text-gray-500 text-sm">
Bookings
</p>

<p className="font-bold text-green-700">
₹{
summary.grossAmount
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
Commission
</p>

<p>
₹{
summary.commission
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
GST Comm
</p>

<p>
₹{
summary.gstCommission
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
TDS
</p>

<p>
₹{
summary.tds
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
TCS
</p>

<p>
₹{
summary.tcs
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
Card Charges
</p>

<p>
₹{
summary.cardCharges
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
Collected
</p>

<p className="font-bold text-green-700">
₹{
summary.collected
.toLocaleString(
"en-IN"
)
}
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
Outstanding
</p>

<p className="font-bold text-red-600">
₹{
summary.outstanding
.toLocaleString(
"en-IN"
)
}
</p>
</div>

</div>

</div>

<div
className="
space-y-3
"
>

{
Object.entries(
sourceSummary
).map(
([source,
v]:any)=>(


<div
key={source}
className="
grid
grid-cols-2
md:grid-cols-4
gap-3
border
rounded-lg
p-3
bg-white
shadow-sm
"
>

<div className="
col-span-2
md:col-span-4
">

<p className="
font-bold
text-lg
text-blue-700
border-b
pb-2
mb-2
">
{source}
</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Bookings
</p>

<p className="
font-bold
text-green-700
">

₹{
v.bookings
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Commission
</p>

<p>

₹{
v.commission
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
GST Comm
</p>

<p>

₹{
(v.gstComm || 0)
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
TDS
</p>

<p>

₹{
v.tds
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
TCS
</p>

<p>

₹{
v.tcs
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Card Charges
</p>

<p>

₹0

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Collected
</p>

<p className="
font-bold
text-green-700
">

₹{
(v.collected || 0)
.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Outstanding
</p>

<p className="
font-bold
text-red-600
">

₹{
v.outstanding
.toLocaleString(
"en-IN"
)
}

</p>

</div>

</div>

))
}

</div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

      <select
        value={propertyFilter}
        onChange={(e)=>
          setPropertyFilter(e.target.value)
        }
        className="border p-2 rounded"
      >
        <option value="">
          All Properties
        </option>

        <option>
          Mahas Elite
        </option>

        <option>
          Mahas Vrindavan
        </option>

      </select>

      <select
       value={sourceFilter}
       onChange={(e)=>
         setSourceFilter(
           e.target.value
         )
       }
       className="border p-2 rounded"
     >

     <option value="">
     All Sources
     </option>

     <option>
     Direct
     </option>

     <option>
     Airbnb
     </option>

     <option>
     Booking.com
     </option>

     <option>
     MakeMyTrip
     </option>

     <option>
     Goibibo
     </option>

     <option>
     Agoda
     </option>

     <option>
     StayFlexi
     </option>

     </select>


      <input
      type="date"
      value={fromDate}
      onChange={(e)=>
      setFromDate(
      e.target.value
      )
      }
      className="border p-2 rounded"
      />

      <input
      type="date"
      value={toDate}
      onChange={(e)=>
      setToDate(
      e.target.value
      )
      }
      className="border p-2 rounded"
      />

      <input
        placeholder="Invoice Number"
        value={invoiceFilter}
        onChange={(e)=>
          setInvoiceFilter(e.target.value)
        }
        className="border p-2 rounded"
      />

      <input
        placeholder="Guest Name"
        value={nameFilter}
        onChange={(e)=>
          setNameFilter(e.target.value)
        }
        className="border p-2 rounded"
      />

    </div>

      {bookings.map((b) => {

      const collected =
      paymentTotals[
      b.id
      ] || 0;

      const pending =
      Number(
      b.net_amount || 0
      )
      -
      collected;

      const status =
      pending <= 0
      ? "Paid"
      : "Pending";

      return (

         <div
           key={b.id}
           className="border rounded-lg p-3 bg-white shadow-sm border-gray-200 space-y-3"
         >
         
<div className="
grid
grid-cols-2
md:grid-cols-3
lg:grid-cols-[1.2fr_1fr_1fr_1.2fr_1.8fr_1.4fr]
gap-3
text-sm
">
  <div>
    <p className="text-gray-500">
      Property
    </p>

    <p className="font-medium">
      {b.property}
    </p>
  </div>

<div>

<p className="text-gray-500">
Month
</p>

<p>

{
b.checkout_date
?

new Date(
b.checkout_date
)
.toLocaleDateString(
"en-IN",
{
month:"short",
year:"numeric"
}
)

: ""

}

</p>

</div>

  <div>
    <p className="text-gray-500">
      Checkout
    </p>

    <p>

    {
    b.checkout_date
    ?

    new Date(
    b.checkout_date
    )

    .toLocaleDateString(
    "en-GB"
    )

    .replaceAll(
    "/",
    "-"
    )

    : ""

    }

    </p>

  </div>

  <div>
    <p className="text-gray-500">
      Source
    </p>

    <p>
      {b.source_type}
    </p>

  </div>

  <div>
    <p className="text-gray-500">
      Invoice
    </p>

    <p className="break-words">
      {b.invoice_number}
    </p>
  </div>

  <div>
    <p className="text-gray-500">
      Name
    </p>

    <p className="break-words">
      {b.guest_name}
    </p>
  </div>

</div>

<div
className="
grid
grid-cols-2
md:grid-cols-4
gap-3
pt-2
border-t
"
>

<div>

<p className="text-gray-500 text-sm">
Amount
</p>

<p className="font-bold text-xl text-green-700">

₹{Number(
b.net_amount || 0
).toLocaleString("en-IN")}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Collected
</p>

<p className="font-semibold">

₹{
collected.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Pending
</p>

<p className="font-semibold">

₹{
pending.toLocaleString(
"en-IN"
)
}

</p>

</div>

<div>

<p className="text-gray-500 text-sm">
Status
</p>

<p
className={
status === "Paid"
? "text-green-600 font-bold"
: "text-red-600 font-bold"
}
>

{status}

</p>

</div>

</div>
         
<div className="flex flex-wrap gap-2 pt-2 border-t">

<button
  onClick={() =>
    router.push(
      `/finance/bookings/${b.id}/payments`
    )
  }
  className="bg-black text-white px-3 py-1 rounded text-xs"
>
  Payments
</button>

{
role !== "viewer"

&&

(
<button
onClick={() =>
router.push(
`/finance/bookings/add?id=${b.id}`
)
}
className="
px-3
py-1
rounded
text-xs
bg-blue-50
text-blue-600
"
>

Edit

</button>
)

}
{
role !== "viewer"

&&

(
<button
onClick={() =>
handleDelete(
b.id
)
}
className="
px-3
py-1
rounded
text-xs
bg-red-50
text-red-600
"
>

Delete

</button>
)

}
</div>

  </div>
  );

      })}
    </div>
  );
}