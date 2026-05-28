import Navbar from "../components/Navbar.tsx";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function App() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatuses, setAdminStatuses] = useState<Record<string, boolean>>({});

  // Move this inside useEffect to avoid redirect during render
  useEffect(() => {
    if (localStorage.getItem("username") == null) {
      window.location.href = "./login";
    }
  }, []);

  const deleteAccount = async (username: string) => {
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      localStorage.removeItem("username");
      window.location.href = "./login";
    } catch (err) {
      alert("Server error");
    }
  };

  const toggleAdmin = async (username: string) => {
    try {
      const currentIsAdmin = adminStatuses[username] || false;
      const response = await fetch("/api/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        return;
      }

      // Update local admin status
      setAdminStatuses(prev => ({
        ...prev,
        [username]: !currentIsAdmin
      }));
      
      alert(`Successfully ${currentIsAdmin ? "removed admin from" : "made"} ${username} ${currentIsAdmin ? "a regular user" : "an admin"}`);
    } catch (err) {
      alert("Server error");
    }
  };

  const viewPosts = (username: string) => {
    // Navigate to user's listings
    window.location.href = `/listings?user=${username}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getAllUsers");
        const data = await response.json();
        setUsers(data);
        
        // Check admin status for each user
        const statuses: Record<string, boolean> = {};
        for (const user of data) {
          const adminStatus = await checkIfAdmin(user.username);
          statuses[user.username] = adminStatus;
        }
        setAdminStatuses(statuses);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkCurrentUserAdmin = async () => {
      const username = localStorage.getItem("username");
      if (username) {
        const adminStatus = await checkIfAdmin(username);
        setIsAdmin(adminStatus);
      }
    };
    
    checkCurrentUserAdmin();
  }, []);

  const checkIfAdmin = async (username: string): Promise<boolean> => {
    if (!username) return false;

    try {
      const res = await fetch(`/api/isAdmin/${username}`);
      const data = await res.json();

      if (res.ok) {
        return data.isAdmin;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const filteredUsers =
    search.trim().length > 0
      ? users.filter((user: any) =>
          user.username.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div>
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <div className="w-130 p-5 rounded m-auto mt-30">
          <h1 className="text-2xl font-bold">Settings</h1>
          <h1 className="border-b-2 pb-2 w-full">
            Welcome, {localStorage.getItem("username")}!
          </h1>
          <div className="flex flex-row gap-2 mt-4">
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => {
                localStorage.removeItem("username");
                window.location.href = "./login";
              }}
            >
              Logout
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => {
                deleteAccount(localStorage.getItem("username") || "");
              }}
            >
              Delete Account
            </button>
          </div>
          
          {isAdmin && (
            <>
              <p className="text-lg font-semibold mt-10">Admin panel</p>
              <div className="relative w-full mb-2">
                <Search className="ml-2 absolute left-2 top-7 border-r-1 pr-2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-12 border-2 mt-5"
                />
              </div>
              
              {search.trim().length > 0 && (
                filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any, i: number) => {
                    const currentUserIsAdmin = localStorage.getItem("username") === user.username;
                    const userIsAdmin = adminStatuses[user.username] || false;
                    
                    return (
                      <div
                        key={i}
                        className="w-full h-10 flex border-b-2 flex-row rounded items-center p-2 pb-3 cursor-pointer hover:bg-neutral-200 hover:drop-shadow transition-colors mb-5"
                      >
                        <p className="font-bold text-xl">{user.username}</p>
                          <div
                            className={`ml-auto ${userIsAdmin ? 'bg-red-500' : 'bg-green-500'} text-white px-2 py-1 rounded text-sm cursor-pointer`}
                            onClick={() => {
                              toggleAdmin(user.username, userIsAdmin);
                            }}
                          >
                            {userIsAdmin ? "Remove Admin" : "Make Admin"}
                          </div>
                        <div
                          className="ml-2 bg-neutral-300 px-2 py-1 rounded text-sm cursor-pointer"
                          onClick={() => {
                            viewPosts(user.username);
                          }}
                        >
                          View listings
                        </div>
                        <div
                          className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm cursor-pointer"
                          onClick={() => {
                            deleteAccount(user.username);
                          }}
                        >
                          Delete Account
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 mt-4">
                    No users found matching "{search}"
                  </div>
                )
              )}
              
              {/* Optional: Show message when search is empty */}
              {search.trim().length === 0 && (
                <div className="text-center text-gray-500 mt-4">
                  Start typing to search for users
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;