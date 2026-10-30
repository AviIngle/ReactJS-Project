
import { useState } from 'react';
import './App.css';

import Card from './Card';
import data from './CardData';
import Header from './Header';
import Herosectio from './Herosectio';

function App() {

  // Uploaded images save karna
  const [uploadedImages, setUploadedImages] = useState(() => {
    return JSON.parse(localStorage.getItem('uploadedImages') || '[]');
  });

  // Deleted images
  const [deletedImages, setDeletedImages] = useState(() => {
    return JSON.parse(localStorage.getItem('deletedImages') || '[]');
  });

  // Download counts
  const [downloadCounts, setDownloadCounts] = useState(() => {
    return JSON.parse(localStorage.getItem('downloadCounts') || '{}');
  });

  // Upload image
  const handleUpload = (event) => {
    event.preventDefault();

    const file = event.target.elements.image.files[0];

    if (!file) {
      alert('Please select an image!');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file!');
      return;
    }

    // LocalStorage limit se bachne ke liye 10 MB limit
if (file.size > 10 * 1024 * 1024) {
  alert('Image size 10 MB se kam honi chahiye!');
  return;
}

    const reader = new FileReader();

    reader.onload = () => {
      const newImage = {
        id: crypto.randomUUID(),
        Image: reader.result
      };

      const updatedImages = [...uploadedImages, newImage];

      setUploadedImages(updatedImages);
      localStorage.setItem(
        'uploadedImages',
        JSON.stringify(updatedImages)
      );

      event.target.reset();
    };

    reader.readAsDataURL(file);
  };

  // Delete image
  const handleDelete = (id) => {
    const updated = [...deletedImages, id];

    setDeletedImages(updated);
    localStorage.setItem('deletedImages', JSON.stringify(updated));
  };

  // Download counter
  const handleDownload = (id) => {
    const updated = {
      ...downloadCounts,
      [id]: (downloadCounts[id] || 0) + 1
    };

    setDownloadCounts(updated);
    localStorage.setItem('downloadCounts', JSON.stringify(updated));
  };

  // Old images + uploaded images
  const allImages = [
    ...data.map((ele) => ({
      id: ele.Image,
      Image: ele.Image
    })),
    ...uploadedImages
  ];

  // Deleted images hide karna
  const visibleImages = allImages.filter(
    (ele) => !deletedImages.includes(ele.id)
  );

  return (
    <>
      <Header />
      <Herosectio />

      {/* Upload Section */}

      <section className="upload-section">

        <h1>Upload Your Status Image & Earn Money</h1>

        <p>
          Upload your favourite status images and let others download them.
        </p>

        <form onSubmit={handleUpload} className="upload-form">

          <input
            type="file"
            name="image"
            accept="image/*"
            required
          />

          <button type="submit">
            Upload Image
          </button>

        </form>

        <p className="upload-note">
          Maximum image size: 2 MB
        </p>

      </section>

      {/* Gallery */}

      <div className="container">

        {visibleImages.map((ele) => (

          <Card
            key={ele.id}
            Img={ele.Image}
            count={downloadCounts[ele.id] || 0}
            onDownload={() => handleDownload(ele.id)}
            onDelete={() => handleDelete(ele.id)}
          />

        ))}

      </div>
    </>
  );
}

export default App;
