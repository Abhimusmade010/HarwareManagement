
<!-- user/delete route:user wants to delete the complaint he posted ->authenticate the user and ->let the admin know that complaint with this id and email is deleted

delete not allowed after the comaplint is resolved onlly delete when the complaint is pending  -->

<!-- no deletion only status updatioin  -->

Now addd the feature of note for the complaint for user and admin as well , admin should will be 


1.User->1.SignUp
        2.Login 
        3.Submit the complaint
        4.Fetch all the complaints
        5.Fetch complaint by applying filter
        6.Add note to the complaint
    Pages for USER->1.Login,SignUp
                    2.Hero page.
                    3.Form Page.
                    4.Dashboard.
                    5.Settings.
                    6.Profile of User.
                    7.Notification in the notification room.
                    

Admin:->1.SignUp.
        2.Login.
        3.Dashboard.
        4.Select on complaint.
        5.Add note to the complaint.
        6.Add the technician to the complaint ->know to the technician and let user know the techinicain details via email.


EMAIL:-

1.Forgot password
2.Reset password
3.Techicial Assignment by admin
4.Email to the admin when new complaint is register
4.Status emailed along with notification in the website 













Dashboard:

📊 Complaint Statistics – Aggregation Logic
🔹 Purpose

This feature is used to fetch complaint statistics for a specific user to display on the dashboard.
It provides:

Total number of complaints

Number of pending complaints

Number of resolved complaints

Number of in-progress complaints

🔹 Architecture

Controller → Handles HTTP request & response

Service → Contains database logic using MongoDB aggregation

Database → MongoDB (Mongoose)

This separation keeps the code clean, testable, and scalable.

🧠 Key Concept Used
MongoDB Aggregation Pipeline

Aggregation pipeline processes documents through multiple stages, where:

Each stage performs a specific operation

Output of one stage is passed to the next stage

Final output provides grouped and computed results

This approach is preferred for analytics and dashboard-related queries.

⚙️ Implementation Summary
1️⃣ Filter Complaints by User

We use the $match stage to select only those complaints that belong to the logged-in user.

{ $match: { userId: ObjectId(userId) } }


This ensures the statistics are user-specific.

2️⃣ Group Complaints by Status

We use the $group stage to group complaints based on their status.

{
  $group: {
    _id: "$status",
    count: { $sum: 1 }
  }
}


_id represents the group key (status)

$sum: 1 counts the number of complaints in each group

3️⃣ Aggregation Result Format

MongoDB returns the result as an array of objects:

[
  { _id: "Pending", count: 3 },
  { _id: "Resolved", count: 5 },
  { _id: "In Progress", count: 2 }
]


Aggregation always returns an array, even if there is only one group.

4️⃣ Transform Result for Frontend

Since the frontend dashboard requires a structured object, we transform the aggregation array using forEach.

We initialize a response object to handle missing statuses safely.

{
  total: 0,
  pending: 0,
  resolved: 0,
  inProgress: 0
}


For each grouped result:

Add count to total

Map status-wise counts to respective fields

This ensures:

No undefined values

Consistent response structure

Easy frontend consumption

🚀 Why Aggregation Was Used

Single database call

Better performance than multiple countDocuments queries

Scales well with large data

Ideal for dashboards and reporting

📝 Notes for Revision

Aggregation pipeline always returns an array

$match should be used early for performance

$group requires _id

forEach is used to transform grouped data into a dashboard-friendly format

This logic is read-only and does not modify database records

✅ Outcome

The final API response is optimized, structured, and ready for dashboard usage.

{
  "total": 10,
  "pending": 3,
  "resolved": 5,
  "inProgress": 2
}












ADMIN:-
🔐 Maintenance Dashboard Access (System-Level Authentication)

The maintenance dashboard is protected using system-level authentication instead of user-based login.
This is intentional, as the system is managed by a single maintenance engineer handling IT-related complaints.

Key Characteristics

No maintenance user registration

No maintenance database schema

Access controlled using a fixed system password

JWT-based protection for maintenance routes

🔑 Maintenance Login

Endpoint

POST /maintenance/login


Description
Authenticates the maintenance engineer using a system password stored in environment variables.
On success, returns a JWT token required for accessing maintenance routes.

Request Body

{
  "password": "<MAINTENANCE_PASSWORD>"
}


Success Response (200)

{
  "success": true,
  "message": "Maintenance login successful",
  "token": "<JWT_TOKEN>"
}


Failure Response (401)

{
  "success": false,
  "message": "Invalid maintenance password"
}

🛡️ Maintenance Route Protection

All maintenance routes are protected using a custom JWT middleware.

Required Header

Authorization: Bearer <JWT_TOKEN>


Requests without a valid token are rejected.

📋 Maintenance Routes
Fetch All Complaints

Endpoint

GET /maintenance/complaints


Description
Allows the maintenance engineer to fetch all complaints submitted by users.

Access

Protected (Maintenance JWT required)

Response

{
  "success": true,
  "complaints": [ ... ]
}

🧠 Design Rationale

Since the system handles only IT-related complaints and is managed by a single maintenance engineer, system-level authentication reduces complexity.

This approach avoids unnecessary user roles while still ensuring restricted access.

Business logic is reused through a shared service layer; access control is handled at the controller/middleware level.