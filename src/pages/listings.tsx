import Navbar from "../components/Navbar.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { X, FilePen, Check, ArrowDown } from "lucide-react";

export function App() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const username = localStorage.getItem("username");
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  if (localStorage.getItem("username") == null) {
    window.location.href = "./login";
  }

  useEffect(() => {
    const fetchAdmin = async () => {
      const username = localStorage.getItem("username");

      if (!username) return;

      try {
        const res = await fetch(
          `/api/isAdmin/${username}`
        );

        const data = await res.json();

        if (res.ok) {
          setIsAdmin(data.isAdmin);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdmin();
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(
          `/api/listing/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            "Failed to fetch listing"
          );
        }

        setListing(data);
        console.log(data);

      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Server error"
        );
      }
    };

    fetchListing();
  }, [id]);

  const DeletePost = async () => {
    try {
      const response = await fetch("/api/delete-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: listing.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }
      window.location.href = `${data.redirect}`;
    } catch (err) {
      alert("Server error");
    }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch("/api/edit-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: listing.id,
          ...editValues,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setListing((prev) => ({
        ...prev,
        ...editValues,
      }));

      setIsEditing(false);
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEditChange = (e) => {
    setEditValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/comments/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setComments(data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchComments();
  }, [id]);
  const addComment = async () => {

    if (!commentInput.trim())
      return;

    const response = await fetch(
      "/api/create-comment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          username: localStorage.getItem("username"),
          comment: commentInput,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    const newComment = {
      username:
        localStorage.getItem(
          "username"
        ),
      comment: commentInput,
      created_at: data.comment.created_at,
    };

    setComments(prev => [
      newComment,
      ...prev,
    ]);

    setCommentInput("");
  };

  return (
    <div className="min-w-screen min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-4 w-200 m-auto relative flex flex-col gap-4">

        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}

        {!listing && !error && (
          <p>Loading...</p>
        )}

        {listing && (
          <>
            {/* Images */}
            {listing.images?.length > 0 && (
              <div className="flex flex-col gap-2">

                {/* Main large image */}
                <img
                  src={`/uploads/${listing.images[0]}`}
                  alt="listing"
                  className="w-full h-120 object-cover rounded-xl"
                />

                {/* Bottom images */}
                {listing.images.length > 1 && (
                  <div
                    className={`grid gap-2 ${listing.images.length === 2
                      ? "grid-cols-1"
                      : listing.images.length === 3
                        ? "grid-cols-2"
                        : "grid-cols-3"
                      }`}
                  >
                    {listing.images
                      .slice(1)
                      .map((image, index) => (
                        <img
                          key={index}
                          src={`/uploads/${image}`}
                          alt="listing"
                          className="w-full h-40 object-cover rounded-xl"
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-row items-center gap-4 p-3 pb-0 relative">
              <h1 className="text-xl font-bold w-fit">
                {listing.title}
              </h1>
              <p>•</p>
              <p className="text-gray-600">
                {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
              </p>
              <input type="button" value="★" className="cursor-pointer text-yellow-400 text-4xl absolute right-0" />
            </div>
            <p className="text-gray-700 font-semibold px-3">
              {listing.description}
            </p>
            <p className="text-2xl text-green-600 font-bold p-3 pt-0 border-b-1">
              {listing.price}€
            </p>

            <div className="flex flex-row gap-2 p-3 pt-0">
              <div className="rounded-full w-7 h-7 bg-gray-400 text-white text-xs flex items-center justify-center font-bold">
                {listing.username?.charAt(0)}
              </div>

              <p className="mt-0.5">
                {listing.username}
              </p>
            </div>
            {(username === listing.username || isAdmin) && (
              <div className="flex flex-row gap-2 p-3 pt-0">
                <button
                  onClick={() => {
                    setEditValues({
                      title: listing.title,
                      category: listing.category,
                      description: listing.description,
                      price: listing.price,
                    });

                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="bg-mist-300 py-2 px-4 pl-8 pt-2 rounded-md cursor-pointer h-8 relative"
                >
                  <FilePen size={20} className="absolute left-2 top-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    DeletePost();
                  }}
                  className="bg-red-800 text-white py-2 px-4 pl-8 pt-2 rounded-md cursor-pointer h-8 relative">
                  <X size={23} className="absolute left-2 top-1.5 text-white" />
                  Delete
                </button>

              </div>

            )}
            {isEditing && editValues && (
              <div className="p-3 flex flex-col gap-2 border-t -mt-3">

                <input
                  name="title"
                  value={editValues.title}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />

                <select
                  name="category"
                  value={editValues.category}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                >
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other</option>
                </select>

                <textarea
                  name="description"
                  value={editValues.description}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />

                <input
                  name="price"
                  value={editValues.price}
                  onChange={handleEditChange}
                  className="border p-2 rounded"
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="bg-emerald-500 text-white py-2 px-4 pl-8 pt-2 rounded-md cursor-pointer h-8 relative"
                  >
                    <Check size={23} className="absolute text-white left-2 top-1.5" />
                    Save
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-mist-300 py-2 px-4 pl-8 pt-2 rounded-md cursor-pointer h-8 relative"
                  >
                    <X size={23} className="absolute left-2 top-1.5" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 border-t pt-4">

              <h2 className="font-bold text-xl mb-4">
                Comments
              </h2>

              <div className="flex gap-2 mb-4">

                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) =>
                    setCommentInput(
                      e.target.value
                    )
                  }
                  placeholder="Write a comment..."
                  className="border p-2 rounded w-full"
                />
                <div className="relative flex items-center">

                <button
                  onClick={addComment}
                  className="bg-mist-300 pl-3 rounded cursor-pointer w-24 h-10"
                >
                                    <ArrowDown size={20} className="absolute left-3" />
                  Post
                </button>
                </div>


              </div>

              <div className="flex flex-col gap-3">

                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-300 py-3"
                  >
                    <p className="font-bold">
                      {comment.username}
                    </p>

                    <p>{comment.comment}</p>

                    <p className="text-xs text-gray-500">
                      {comment.created_at}
                    </p>
                  </div>
                ))}

              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default App;