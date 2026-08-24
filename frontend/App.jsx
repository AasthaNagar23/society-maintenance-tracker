import Login from "./pages/Login";
import Register from "./pages/Register";
import ResidentDashboard from "./pages/ResidentDashboard";
import CreateComplaint from "./pages/CreateComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import Maintenance from "./pages/Maintenance";
import CreateMaintenance from "./pages/CreateMaintenance";
import NoticeBoard from "./pages/NoticeBoard";

function App() {
  const token = localStorage.getItem("access_token");
  const storedUser = localStorage.getItem("user");

  const path = window.location.pathname;

  // Register page
  if (path === "/register") {
    return <Register />;
  }

  // User is not logged in
  if (!token) {
    return <Login />;
  }

  // Notice Board
  if (path === "/notices") {
    return <NoticeBoard />;
  }

  // Raise Complaint
  if (path === "/complaint") {
    return <CreateComplaint />;
  }

  // My Complaints
  if (path === "/my-complaints") {
    return <MyComplaints />;
  }

  // Maintenance
  if (path === "/maintenance") {
    return <Maintenance />;
  }

  // Create Maintenance - Admin
  if (path === "/create-maintenance") {
    return <CreateMaintenance />;
  }

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  // Admin Dashboard
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  // Resident Dashboard
  return <ResidentDashboard />;
}

export default App;