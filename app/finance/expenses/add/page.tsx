"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// GET ID
export default function AddExpense() {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setEditId(id);
    }
  }, []);  


  const [form, setForm] = useState({
  date: new Date().toISOString().split("T")[0],
  property: "",
  category: "",
  paid_to: "",

  net_amount: "",
  gst_amount: "",
  gross_amount: "",

  supplier_invoice: "",
  supplier_gst: "",
  notes: "",
});

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchExpense = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", editId as string)
      .single();

    if (!error && data) {
      setForm({
        date: data.date || "",
        property: data.property || "",
        category: data.category || "",
        paid_to: data.paid_to || "",

        net_amount: data.net_amount?.toString() || "",
        gst_amount: data.gst_amount?.toString() || "",
        gross_amount: data.gross_amount?.toString() || "",

        supplier_invoice: data.supplier_invoice || "",
        supplier_gst: data.supplier_gst || "",
        notes: data.notes || "",
      });
    }
  };

// FETCH DATA
useEffect(() => {
  if (!editId) return;
  fetchExpense();
}, [editId]);


  const handleSubmit = async () => {
    if (!form.date || !form.property || !form.category || !form.net_amount) {
      alert("Fill required fields");
      return;
    }

    let error;

    if (editId) {
      const res = await supabase
        .from("expenses")
        .update({
          date: form.date,
          property: form.property,
          category: form.category,
          paid_to: form.paid_to,

          net_amount: Number(form.net_amount || 0),
          gst_amount: Number(form.gst_amount || 0),
          gross_amount: Number(form.gross_amount || 0),

          supplier_invoice: form.supplier_invoice,
          supplier_gst: form.supplier_gst,
          notes: form.notes,
        })
        .eq("id", editId);

      error = res.error;
    } else {
      const res = await supabase.from("expenses").insert([
        {
          date: form.date,
          property: form.property,
          category: form.category,
          paid_to: form.paid_to,

          net_amount: Number(form.net_amount || 0),
          gst_amount: Number(form.gst_amount || 0),
          gross_amount: Number(form.gross_amount || 0),

          supplier_invoice: form.supplier_invoice,
          supplier_gst: form.supplier_gst,
          notes: form.notes,
        },
      ]);

      error = res.error;
    }

    if (error) {
      alert(error.message);
    } else {
      alert(editId ? "Updated successfully" : "Expense added");

      if (editId) {
        router.push("/finance/expenses");
      } else {
        setForm({
          date: new Date().toISOString().split("T")[0],
          property: "",
          category: "",
          paid_to: "",
          net_amount: "",
          gst_amount: "",
          gross_amount: "",
          supplier_invoice: "",
          supplier_gst: "",
          notes: "",
        });
      }
    }
  };

      
  return (
    <div className="p-4 max-w-xl mx-auto space-y-3">
      <h2 className="text-xl font-bold">
        {editId ? "Edit Expense" : "Add Expense"}
      </h2>

      {/* DATE */}
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="input"
      />

      {/* PROPERTY */}
      <select
        name="property"
        value={form.property}
        onChange={handleChange}
        className="input"
      >
        <option value="">Select Property *</option>
        <option>Mahas Elite</option>
        <option>Mahas Vrindavan</option>
        <option>Common</option>
      </select>

      {/* CATEGORY */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="input"
      >
        <option value="">Select Category *</option>
        <option>Rent</option>
        <option>Salary</option>
        <option>Electricity</option>
        <option>Housekeeping</option>
        <option>Maintenance</option>
        <option>OTA Charges</option>
        <option>Payment Charges</option>
        <option>Card/UPI Charges</option>
        <option>Staff Expenses</option>
        <option>Business Travel</option>
        <option>GST Payment</option>
        <option>TDS Payment</option>
        <option>Loan Repay</option>
        <option>Misc</option>
      </select>

      {/* PAID TO */}
      <input
        name="paid_to"
        value={form.paid_to}
        placeholder="Paid To (Supplier / Person)"
        onChange={handleChange}
        className="input"
      />

      {/* AMOUNTS */}
      <input
        name="net_amount"
        value={form.net_amount}
        placeholder="Net Amount (₹) *"
        onChange={handleChange}
        className="input"
      />

      <input
        name="gst_amount"
        value={form.gst_amount}
        placeholder="GST Amount (₹)"
        onChange={handleChange}
        className="input"
      />

      <input
        name="gross_amount"
        value={form.gross_amount}
        placeholder="Gross Amount (₹)"
        onChange={handleChange}
        className="input"
      />

      {/* EXTRA */}
      <input
        name="supplier_invoice"
        value={form.supplier_invoice}
        placeholder="Supplier Invoice (optional)"
        onChange={handleChange}
        className="input"
      />

      <input
        name="supplier_gst"
        value={form.supplier_gst}
        placeholder="Supplier GST (optional)"
        onChange={handleChange}
        className="input"
      />

      <textarea
        name="notes"
        value={form.notes}
        placeholder="Notes"
        onChange={handleChange}
        className="input"
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white p-3 rounded w-full"
      >
        {editId ? "Update Expense" : "Save Expense"}
      </button>
    </div>
  );
}