"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function PaymentsPage() {
  const [booking, setBooking] = useState<any>(null);
  const params = useParams();
  const bookingId = params.id as string;

  const [payments, setPayments] = useState<any[]>([]);

  const [form, setForm] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    payment_mode: "",
    payment_amount: "",
    card_charges: "",
  });

  // FETCH PAYMENTS
  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId);

    if (error) {
      console.error(error);
    } else {
      setPayments(data || []);
    }
  };

  const fetchBooking = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error(error);
    } else {
      setBooking(data);
    }
  };


  useEffect(() => {
    if (bookingId) {
      fetchPayments();
      fetchBooking();
    }
  }, [bookingId]);


  // HANDLE INPUT
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SAVE PAYMENT
  const handleSubmit = async () => {
    if (!form.payment_amount || !form.payment_mode) {
      alert("Please enter amount and mode");
      return;
    }

    const { error } = await supabase.from("payments").insert([
      {
        booking_id: bookingId,
        payment_date: form.payment_date,
        payment_mode: form.payment_mode,
        payment_amount: Number(form.payment_amount || 0),
        card_charges: Number(form.card_charges || 0),
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      alert("Payment added");

      // RESET FORM
      setForm({
        payment_date: new Date().toISOString().split("T")[0],
        payment_mode: "",
        payment_amount: "",
        card_charges: "",
      });

      fetchPayments();
    }
  };

  // TOTAL PAID
  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.payment_amount),
    0
  );

  const pending =
    (booking?.net_amount || 0) - totalPaid;

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this payment?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchPayments(); // refresh list
    }
  };


  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Payments</h2>

    {booking && (
       <div className="bg-gray-100 p-3 rounded space-y-1">
         <p><strong>Guest:</strong> {booking.guest_name}</p>
         <p><strong>Property:</strong> {booking.property}</p>
         <p><strong>Net Amount:</strong> ₹{booking.net_amount}</p>
       </div>
    )}

      {/* ADD PAYMENT */}
      <div className="space-y-2">
        <input
          type="date"
          name="payment_date"
          value={form.payment_date}
          onChange={handleChange}
          className="input"
        />

        <select
          name="payment_mode"
          value={form.payment_mode}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select Mode *</option>
          <option>UPI</option>
          <option>Bank</option>
          <option>Cash</option>
          <option>Card</option>
        </select>

       <input
          name="payment_amount"
          value={form.payment_amount}
          placeholder="Payment Amount (₹) *"
          onChange={handleChange}
          className="input"
        />

        <input
          name="card_charges"
          value={form.card_charges}
          placeholder="Card Charges (₹)"
          onChange={handleChange}
          className="input"
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white p-2 rounded w-full"
        >
          Add Payment
        </button>
      </div>

      {/* SUMMARY */}
      <div className="bg-gray-100 p-3 rounded">
        <p>Total Paid: ₹{totalPaid}</p>
        <p>Pending: ₹{pending}</p>
      </div>

      {/* PAYMENT LIST */}
      <div className="space-y-2">


        {payments.map((p) => (
          <div
            key={p.id}
            className="border p-2 rounded flex justify-between items-center"
  >
            <div>
              <p>₹{p.payment_amount}</p>
              <p className="text-sm text-gray-600">
                {p.payment_mode} | {p.payment_date}
              </p>
            </div>

            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
         ))}


      </div>
    </div>
  );
}