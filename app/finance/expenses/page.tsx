"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const router = useRouter();

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (!error) setExpenses(data || []);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this expense?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchExpenses();
    }
  };

  return (
    <div className="container space-y-4">
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Expenses</h2>

        <button
          onClick={() => router.push("/finance/expenses/add")}
          className="bg-black text-white px-3 py-1 rounded text-sm"
      >
        + Add
      </button>
     </div>
      

      {expenses.map((e) => (
        <div
          key={e.id}
          className="border rounded-lg p-3 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition"
        >
          <div>
            <p className="font-bold">
              ₹{Number(e.net_amount || 0).toLocaleString("en-IN")}
            </p>
            <p className="text-sm">{e.category}</p>
            <p className="text-sm text-gray-600">
              {e.property} | {e.date}
            </p>
            {e.paid_to && (
              <p className="text-sm text-gray-500">
                Paid to: {e.paid_to}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() =>
                router.push(`/finance/expenses/add?id=${e.id}`)
              }
              className="text-blue-600"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(e.id)}
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