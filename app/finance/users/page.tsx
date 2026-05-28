"use client";

import {
useEffect,
useState
} from "react";

import { supabase }
from "@/lib/supabase";

import { useRouter }
from "next/navigation";

export default function UsersPage(){

const [users,
setUsers] =
useState<any[]>([]);

const router =
useRouter();

const [role,
setRole] =
useState("");

const [editId,
setEditId] =
useState("");

const [form,
setForm] =
useState({

username:"",
password:"",
role:"",
property:""

});

const fetchUsers =
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
.order(
"username"
);

if(
!error
){

setUsers(
data || []
);

}

};

useEffect(()=>{

const userRole =
sessionStorage.getItem(
"finance_role"
)
||
"";

setRole(
userRole
);

if(
userRole !==
"admin"
){

router.push(
"/finance"
);

return;

}

fetchUsers();

},[]);

const handleChange =
(e:any)=>{

setForm({

...form,

[e.target.name]:
e.target.value

});

};

const handleSave =
async()=>{

if(
!form.username
||
!form.password
||
!form.role
){

alert(
"Fill all required fields"
);

return;

}

let error;

if(
editId
){

const result =
await supabase
.from(
"finance_users"
)
.update({

username:
form.username,

password:
form.password,

role:
form.role,

property:
form.property

})
.eq(
"id",
editId
);

error =
result.error;

}
else{

const result =
await supabase
.from(
"finance_users"
)
.insert([{

username:
form.username,

password:
form.password,

role:
form.role,

property:
form.property

}]);

error =
result.error;

}

if(error){

alert(
error.message
);

}
else{

alert(

editId
?
"User updated"
:
"User created"

);

setForm({

username:"",
password:"",
role:"",
property:""

});

setEditId("");

fetchUsers();

}

};

const handleDelete =
async(id:string)=>{

const confirmDelete =
confirm(
"Delete user?"
);

if(
!confirmDelete
) return;

const { error } =
await supabase
.from(
"finance_users"
)
.delete()
.eq(
"id",
id
);

if(error){

alert(
error.message
);

}
else{

fetchUsers();

}

};

return(

<div className="
p-4
space-y-4
">

<h2 className="
text-xl
font-bold
">

User Management

</h2>

<div className="
grid
grid-cols-2
gap-2
border
rounded
p-3
bg-white
shadow-sm
">

<input
name="username"
placeholder="Username"
value={form.username}
onChange={handleChange}
className="
border
p-2
rounded
"
/>

<input
name="password"
placeholder="Password"
value={form.password}
onChange={handleChange}
className="
border
p-2
rounded
"
/>

<select
name="role"
value={form.role}
onChange={handleChange}
className="
border
p-2
rounded
"
>

<option value="">
Select Role
</option>

<option>
admin
</option>

<option>
viewer
</option>

<option>
manager
</option>

<option>
director
</option>

</select>

<select
name="property"
value={form.property}
onChange={handleChange}
className="
border
p-2
rounded
"
>

<option value="">
Select Property
</option>

<option value="Mahas Elite">
Mahas Elite
</option>

<option value="Mahas Vrindavan">
Mahas Vrindavan
</option>

</select>

<button
onClick={handleSave}
className="
bg-black
text-white
p-2
rounded
col-span-2
"
>

{
editId
?
`Update User`
:
`Create User`
}

</button>

</div>

<div className="
space-y-2
">

{

users.map(
(u)=>(

<div
key={u.id}
className="
border
rounded
p-3
bg-white
shadow-sm
flex
justify-between
items-center
"
>

<div>

<p className="
font-bold
">

{u.username}

</p>

<p className="
text-sm
text-gray-600
">

{u.role}

</p>

<p className="
text-sm
text-blue-600
">

{u.property || "All"}

</p>

</div>


<div className="
flex
gap-3
items-center
">

<button
onClick={() => {

setEditId(
u.id
);

setForm({

username:
u.username || "",

password:
u.password || "",

role:
u.role || "",

property:
u.property || ""

});

}}
className="
text-blue-600
text-sm
"
type="button"
>

Edit

</button>

<button
onClick={()=>
handleDelete(
u.id
)
}
className="
text-red-600
text-sm
"
type="button"
>

Delete

</button>

</div>

</div>

))
}

</div>

</div>

);

}