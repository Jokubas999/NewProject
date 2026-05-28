import Navbar from "../components/Navbar.tsx";
import { ArrowDownToLine, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import validation from '../CreateListingValidation';

export function App() {
  const [photos, setPhotos] = useState([]);

  if (localStorage.getItem("username") == null) {
    window.location.href = "./login";
  }

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

    // remaining upload slots
    const remaining = 4 - photos.length;

    // limit uploads to 4 total
    const selectedFiles = files.slice(0, remaining);

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...mappedFiles]);

    // reset input so same file can be uploaded again later
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const [values, setValues] = useState({
    title: "",
    category: "electronics",
    description: "",
    price: "",
  });

  const [errors, setErrors] = useState<{ error?: string }>({});

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationErrors = validation(values);

    setErrors(validationErrors);

    if (validationErrors.error === "") {
      try {
        // Create form data
        const formData = new FormData();

        // Text fields
        formData.append("title", values.title);
        formData.append("category", values.category);
        formData.append("description", values.description);
        formData.append("price", values.price);
        formData.append("username", localStorage.getItem("username") || "");

        // Images
        if (photos.length === 0) {
          setErrors({ error: "Please upload at least one photo" });
          return;
        }
        photos.forEach((photo) => {
          formData.append("images", photo.file);
        });

        const response = await fetch(
          "/api/createListing",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setErrors({ error: data.error });
          return;
        }

        setPhotos([]);

        window.location.href = "./listing/" + data.listingId;

      } catch (err) {
        console.error(err);

        setErrors({
          error: "Server error",
        });
      }
    }
  };

  return (
    <div>
      <div className="min-w-screen min-h-screen">
        <Navbar />
        <form onSubmit={handleSubmit}>
          <main className="p-4 w-200 m-auto relative flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-row gap-2 mt-10 items-center relative">
              <p className="font-bold text-sm right-158 absolute">
                Title:
              </p>

              <input
                type="text"
                onChange={handleInput}
                name="title"
                placeholder="Enter title..."
                className="rounded border border-gray-400 p-1 h-7 w-130 absolute right-25 focus:ring-1 focus:ring-gray-900 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="flex flex-row gap-2 mt-10 items-center relative">
              <p className="font-bold text-sm right-158 absolute">
                Category:
              </p>

              <select
                className="rounded border border-gray-400 p-1 h-7 w-130 absolute right-25 focus:ring-1 focus:ring-gray-900 focus:outline-none"
                onChange={handleInput}
                name="category"
                value={values.category}
              >
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="flex flex-row gap-2 mt-27 items-center relative">
              <p className="font-bold text-sm right-158 -top-20 absolute">
                Description:
              </p>

              <textarea
                className="rounded border border-gray-400 p-2 h-40 w-130 absolute right-25 resize-none focus:ring-1 focus:ring-gray-900 focus:outline-none"
                placeholder="Enter description..."
                onChange={handleInput}
                name="description"
              ></textarea>
            </div>

            {/* Price */}
            <div className="flex flex-row gap-2 mt-26 items-center relative">
              <p className="font-bold text-sm right-158 absolute">
                Price:
              </p>

              <textarea
                className="rounded border border-gray-400 p-1 h-7 w-25 absolute left-37 resize-none overflow-hidden focus:ring-1 focus:ring-gray-900 focus:outline-none"
                onChange={handleInput}
                name="price"
              ></textarea>
              <p className="absolute left-63 mt-1">€</p>
            </div>

            {/* Photos */}
            <div className="flex flex-row gap-2 mt-6 relative">
              <p className="font-bold text-sm right-158 top-0 absolute">
                Photos:
              </p>

              <div className="rounded border border-gray-400 border-dashed p-4 min-h-35 w-130 ml-36 flex flex-col">
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />

                {/* Upload Area */}
                {photos.length < 4 && (
                  <label
                    htmlFor="photo-upload"
                    className="h-35 cursor-pointer flex flex-col items-center justify-center"
                  >
                    <UploadCloud
                      className="text-gray-500"
                      size={30}
                    />

                    <p className="text-gray-500 text-sm mt-2">
                      Click to upload photos
                    </p>

                    <p className="text-gray-400 text-xs mt-1">
                      {photos.length}/4 photos uploaded
                    </p>
                  </label>
                )}

                {/* Preview Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-square"
                      >
                        <img
                          src={photo.preview}
                          alt="preview"
                          className="w-full h-full object-cover rounded border"
                        />

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {errors.error && (
              <p className="text-red-500 text-sm mt-1">
                {errors.error}
              </p>
            )}
            <button
              type="submit"
              className="relative bg-green-600 w-40 text-white py-1 pl-5 pt-1.5 rounded hover:bg-green-700 ml-126 font-bold">
              <ArrowDownToLine size={20} className="text-white absolute left-3" />Create Listing
            </button>
          </main>
        </form>
      </div>
    </div>
  );
}

export default App;