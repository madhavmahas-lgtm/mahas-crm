"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);

  const [role, setRole] = useState("");
  const [userProperty, setUserProperty] = useState("");

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("finance_auth");

    if(
    isAuth === "true"
    ){

    setAuthenticated(
    true
    );

    setRole(
    sessionStorage.getItem(
    "finance_role"
    )
    ||""
    );

    setUserProperty(
    sessionStorage.getItem(
    "finance_property"
    )
    ||""
    );

    }

    setLoading(false);
  }, []);

  const handleLogin =
async()=>{

const {
data,
error
}
=
await supabase

.from(
"finance_users"
)

.select("*")

.eq(
"username",
username
)

.eq(
"password",
password
)

.single();

if(
error
||
!data
){

alert(
"Wrong credentials"
);

return;

}

sessionStorage.setItem(
"finance_auth",
"true"
);

sessionStorage.setItem(
"finance_user",
data.username
);

sessionStorage.setItem(
"finance_role",
data.role
);

sessionStorage.setItem(
"finance_property",
data.property || ""
);

setAuthenticated(
true
);

setRole(
data.role
);

setUserProperty(
data.property || ""
);

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

          type="text"

          placeholder="Username"

          value={username}

          onChange={(e)=>

          setUsername(
          e.target.value
          )

          }

          className="
          border
          w-full
          p-2
          rounded
          "

          />

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

{
(
role === "admin"
||
role === "director"
)

&&

<a href="/finance/petty-cash">
💵 Petty Cash
</a>

}

{
(
role === "admin"
||
role === "director"
)
&&

<a href="/finance/dashboard">
📊 Dashboard
</a>

}

{
(
role === "admin"
||
role === "director"
)
&&

<a href="/finance/audit">
📋 Audit
</a>

}

{
role === "admin"
&&

<a href="/finance/users">
👥 Users
</a>

}

{
(
role === "admin"
||
role === "director"
)
&&

<a href="/finance/mis">
👑 MIS
</a>

}

{
(
role === "admin"
||
role === "director"
)
&&

<a href="/finance/reports">
📑 Reports
</a>


}

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