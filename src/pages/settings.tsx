import Navbar from "../components/Navbar.tsx";

export function App() {
  if (localStorage.getItem("username") == null) {
    window.location.href = "./login";
  }

  const deleteAccount = async () => {
    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: localStorage.getItem("username"),
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

  return (
    <div>
      <div className="min-w-screen min-h-screen bg-gray-100">
        <Navbar />
        <div className="bg-gray-200 w-60 p-5 rounded m-auto mt-30">
          <h1>User settings</h1>
          <div className="flex flex-row gap-2 mt-4">
            <button className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              onClick={() => {
                localStorage.removeItem("username");
                window.location.href = "./login";
              }}>
              Logout
            </button>
            <button className="bg-red-500 text-white px-2 py-1 rounded text-sm"
              onClick={() => {
                deleteAccount();
              }}>
              Delete Account
            </button>
          </div>
        </div>
      </div >

    </div >
  );
}

export default App;
