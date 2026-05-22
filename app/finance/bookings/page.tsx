"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);

  const [propertyFilter, setPropertyFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  const router = useRouter();

  const fetchBookings = async () => {
    let query = supabase
  .from("bookings")
  .select("*")
  .order("checkout_date", { ascending: false });

// DEFAULT = TODAY
const today =
  new Date()
    .toISOString()
    .split("T")[0];

// Apply today unless month,
// invoice or name search used

if (
  !monthFilter &&
  !invoiceFilter &&
  !nameFilter
) {
  query = query.eq(
    "checkout_date",
    today
  );
}
    // PROPERTY FILTER
    if (propertyFilter) {
      query = query.eq("property", propertyFilter);
    }

    // MONTH FILTER
   if (monthFilter) {

  const startDate =
    `${monthFilter}-01`;

  const nextMonth =
    new Date(
      monthFilter + "-01"
    );

  nextMonth.setMonth(
    nextMonth.getMonth() + 1
  );

  const endDate =
    nextMonth
      .toISOString()
      .split("T")[0];

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
    }
  };


  useEffect(() => {
    fetchBookings();
  }, [
    propertyFilter,
    monthFilter,
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
    setMonthFilter("");
    setInvoiceFilter("");
    setNameFilter("");
    }}
    className="border px-3 py-1 rounded text-sm"
    >
    Clear
    </button>

    <button
    onClick={() =>
    router.push(
    "/finance/bookings/add"
    )
    }
    className="bg-black text-white px-3 py-1 rounded"
    >
    + Add
    </button>

    </div>

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

      <input
        type="month"
        title="Filter by Month"
        value={monthFilter}
        onChange={(e)=>
          setMonthFilter(e.target.value)
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

      {bookings.map((b) => (
         <div
           key={b.id}
           className="border rounded-lg p-3 bg-white shadow-sm border-gray-200 space-y-3"
         >
         
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 text-sm flex-1">
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
      {b.checkout_date?.slice(0,7)}
    </p>
  </div>

  <div>
    <p className="text-gray-500">
      Checkout
    </p>

    <p>
      {b.checkout_date}
    </p>
  </div>

  <div>
    <p className="text-gray-500">
      Invoice
    </p>

    <p>
      {b.invoice_number}
    </p>
  </div>

  <div>
    <p className="text-gray-500">
      Name
    </p>

    <p>
      {b.guest_name}
    </p>
  </div>

  <div>
    <p className="text-gray-500">
      Amount
    </p>

    <p className="font-bold">
      ₹{Number(
        b.net_amount || 0
      ).toLocaleString("en-IN")}
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

<button
  onClick={() =>
    router.push(
      `/finance/bookings/add?id=${b.id}`
    )
  }
  className="px-3 py-1 rounded text-xs bg-blue-50 text-blue-600"
>
  Edit
</button>

<button
  onClick={() =>
    handleDelete(b.id)
  }
  className="px-3 py-1 rounded text-xs bg-red-50 text-red-600"
>
  Delete
</button>

</div>

  </div>

      ))}
    </div>
  );
}