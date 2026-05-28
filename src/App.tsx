import Navbar from "./components/Navbar";
import "./index.css";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function App() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  if (localStorage.getItem("username") == null) {
    window.location.href = "./login";
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getAllListings");
        const data = await response.json();
        setListings(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const filteredListings = listings.filter((listing: any) =>
    listing.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="min-w-screen min-h-screen">
        <Navbar />

        <main>
          <div className="w-1/2 h-100 m-auto">
            <div className="flex flew-row pb-10">
              <div className="relative w-full">
                <Search className="ml-2 absolute left-2 top-7 border-r-1 pr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-12 border-2 mt-5"
                />
              </div>
            </div>

            {filteredListings.map((listing: any, i: number) => (
              <div
                key={i}
                onClick={() => (window.location.href = `./listing/${listing.id}`)}
                className="w-full h-35 flex flex-row rounded cursor-pointer hover:bg-neutral-100 hover:drop-shadow transition-colors mb-5"
              >
                <img
                  src={`./uploads/${listing.images?.[0]}`}
                  alt="Listing"
                  className="h-full w-60 object-cover rounded pr-3"
                />

                <div className="relative">
                  <p className="font-bold text-xl">{listing.title}</p>
                  <p className="text-lg">{listing.description}</p>
                  <p className="font-sm bg-slate-100 px-2 rounded w-fit mt-2">
                    {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
                  </p>
                  <p className="font-semibold text-green-700 text-2xl absolute bottom-1">
                    {listing.price}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;