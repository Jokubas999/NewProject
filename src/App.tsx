import Navbar from "./components/Navbar";
import "./index.css";

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
    </div>
    </div>
  );
}

export default App;
