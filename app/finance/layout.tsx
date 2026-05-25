"use client";

import { useState, useEffect } from "react";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("finance_auth");

    if (isAuth === "true") {
      setAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const handleLogin = () => {
    const correctPassword =
      process.env.NEXT_PUBLIC_FINANCE_PASSWORD;

    if (password === correctPassword) {
      sessionStorage.setItem(
        "finance_auth",
        "true"
      );

      setAuthenticated(true);
    } else {
      alert("Wrong password");
    }
  };

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 w-80">

          <h2 className="text-xl font-bold text-center">
            Finance Access
          </h2>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="border w-full p-2 rounded"
          />

          <button
            onClick={handleLogin}
            className="bg-black text-white w-full p-2 rounded"
          >
            Enter
          </button>

        </div>
      </div>
    );
  }

  return (
    <div>
      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center p-3 border-b bg-white sticky top-0 z-10">

        <div className="
flex
gap-4
text-sm
font-semibold
overflow-x-auto
">

<a href="/finance">
🏠 Finance Center
</a>

<a href="/finance/bookings">
📖 Bookings
</a>

<a href="/finance/expenses">
💰 Expenses
</a>

<a href="/finance/dashboard">
📊 Dashboard
</a>

<a href="/finance/mis">
👑 MIS
</a>

</div>

        <button
          onClick={() => {
            sessionStorage.removeItem(
              "finance_auth"
            );

            setAuthenticated(false);

            window.location.reload();
          }}
          className="text-xs text-red-500"
        >
          Logout
        </button>
      </div>

      <div className="p-4">
        {children}
      </div>
    </div>
  );
}