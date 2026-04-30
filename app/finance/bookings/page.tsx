"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setBookings(data || []);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
      <h2 className="text-xl font-bold">Bookings</h2>

      <button
        onClick={() => router.push("/finance/bookings/add")}
        className="bg-black text-white px-3 py-1 rounded"
    >
      + Add
    </button>
  </div>

      {bookings.map((b) => (
         <div
           key={b.id}
           className="border rounded-lg p-3 flex justify-between items-center bg-white shadow-sm border-gray-200"
         >
         
         <div>
           <p className="font-semibold text-base">{b.guest_name}</p>

           <p className="text-sm text-gray-600">
             {b.property} | {b.booking_date} → {b.checkout_date}
           </p>

           <p className="text-lg font-bold mt-1">
             ₹{Number(b.net_amount || 0).toLocaleString("en-IN")}
           </p>
         </div>
         
        <div className="flex items-center gap-3 text-sm">
  
  <button
    onClick={() =>
      router.push(`/finance/bookings/${b.id}/payments`)
    }
    className="bg-black text-white px-3 py-1.5 rounded"
  >
    Payments
  </button>

  <button
    onClick={() =>
      router.push(`/finance/bookings/add?id=${b.id}`)
    }
    className="text-blue-600"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(b.id)}
    className="text-red-600"
  >
    Delete
  </button>
  
</div>
  </div>

      ))}
    </div>
  );
}