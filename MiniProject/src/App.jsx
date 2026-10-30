
import { useEffect, useState } from 'react';
import './App.css';

import Card from './Card';
import data from './CardData';
import Header from './Header';
import Herosectio from './Herosectio';
import Auth from './Auth';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [likedImageIds, setLikedImageIds] = useState([]);
  const [busyLikeIds, setBusyLikeIds] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Login session check
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) console.error(error.message);

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch images from Supabase
  const fetchImages = async () => {
    setLoadingImages(true);

    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Image loading error:', error.message);
      alert(error.message);
    } else {
      setUploadedImages(images || []);
    }

    setLoadingImages(false);
  };

  // Fetch current user's Like records
  const fetchLikedImages = async () => {
    if (!session?.user?.id) return;

    const { data: actions, error } = await supabase
      .from('image_actions')
      .select('image_id')
      .eq('user_id', session.user.id)
      .eq('action_type', 'like');

    if (error) {
      console.error('Like loading error:', error.message);
      return;
    }

    setLikedImageIds((actions || []).map((action) => action.image_id));
  };

  // Load images after login
  useEffect(() => {
    if (session) {
      fetchImages();
      fetchLikedImages();
    } else {
      setUploadedImages([]);
      setLikedImageIds([]);
    }
  }, [session]);

  // Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) alert(error.message);
  };

  // Upload image
  const handleUpload = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const file = form.elements.image.files[0];
    const authorName = form.elements.authorName.value.trim();

    if (!file) {
      alert('Please select an image!');
      return;
    }

    if (!authorName) {
      alert('Please enter your name!');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size 2 MB se kam honi chahiye!');
      return;
    }

    setUploading(true);

    try {
      const userId = session.user.id;
      const filePath = `${userId}/${crypto.randomUUID()}-${file.name}`;

      const { error: storageError } = await supabase.storage
        .from('status-images')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: publicData } = supabase.storage
        .from('status-images')
        .getPublicUrl(filePath);

      const { error: databaseError } = await supabase
        .from('images')
        .insert({
          user_id: userId,
          image_url: publicData.publicUrl,
          author_name: authorName,
        });

      if (databaseError) {
        await supabase.storage
          .from('status-images')
          .remove([filePath]);

        throw databaseError;
      }

      alert('Image uploaded successfully!');
      form.reset();
      await fetchImages();
    } catch (error) {
      console.error('Upload error:', error.message);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Like / Unlike
  const handleLike = async (image) => {
    if (image.isSample) {
      alert('Sample images par Like save nahi ho sakta.');
      return;
    }

    if (busyLikeIds.includes(image.id)) return;

    setBusyLikeIds((previous) => [...previous, image.id]);

    try {
      const alreadyLiked = likedImageIds.includes(image.id);

      if (alreadyLiked) {
        const { error } = await supabase
          .from('image_actions')
          .delete()
          .eq('image_id', image.id)
          .eq('user_id', session.user.id)
          .eq('action_type', 'like');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('image_actions')
          .insert({
            image_id: image.id,
            user_id: session.user.id,
            action_type: 'like',
          });

        if (error) throw error;
      }

      await Promise.all([fetchImages(), fetchLikedImages()]);
    } catch (error) {
      console.error('Like error:', error.message);
      alert('Like update nahi hua: ' + error.message);
    } finally {
      setBusyLikeIds((previous) =>
        previous.filter((id) => id !== image.id)
      );
    }
  };

  // Share / Download counter
  const handleImageAction = async (image, actionType) => {
    if (image.isSample) return;

    try {
      const { error } = await supabase
        .from('image_actions')
        .insert({
          image_id: image.id,
          user_id: session.user.id,
          action_type: actionType,
        });

      if (error) {
        if (error.code === '23505') {
          alert('Is image ke liye aapka ye action pehle count ho chuka hai.');
          return;
        }

        throw error;
      }

      await fetchImages();
    } catch (error) {
      console.error(`${actionType} counter error:`, error.message);
      alert(`${actionType} count update nahi hua: ${error.message}`);
    }
  };

  const handleShare = (image) => {
    handleImageAction(image, 'share');
  };

  const handleDownload = (image) => {
    handleImageAction(image, 'download');
  };

  // Delete image
  const handleDelete = async (image) => {
    if (image.user_id !== session.user.id) {
      alert('You can only delete your own images!');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this image?'
    );

    if (!confirmed) return;

    try {
      const imageUrl = new URL(image.image_url);
      const marker = '/status-images/';
      const filePath = imageUrl.pathname.split(marker)[1];

      if (!filePath) {
        throw new Error('Image storage path could not be found.');
      }

      const { error: storageError } = await supabase.storage
        .from('status-images')
        .remove([decodeURIComponent(filePath)]);

      if (storageError) throw storageError;

      const { error: databaseError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id)
        .eq('user_id', session.user.id);

      if (databaseError) throw databaseError;

      await fetchImages();
    } catch (error) {
      alert('Delete error: ' + error.message);
    }
  };

  // Sample images
  const sampleImages = data.map((ele) => ({
    id: ele.Image,
    image_url: ele.Image,
    user_id: null,
    author_name: ele.Name,
    isSample: true,
  }));

  const allImages = [...sampleImages, ...uploadedImages];

  if (authLoading) {
    return <h2>Loading...</h2>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <>
      <Header />
      <Herosectio />

      <div className="user-bar">
        <span>Logged in: {session.user.email}</span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <section className="upload-section">
        <h1>Upload Your Status Image & Earn Money</h1>

        <p>
          Upload your favourite status images and let others download them.
        </p>

        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="text"
            name="authorName"
            placeholder="Enter your name"
            required
          />

          <input
            type="file"
            name="image"
            accept="image/*"
            required
          />

          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>

        <p className="upload-note">
          Maximum image size: 2 MB
        </p>
      </section>

      {loadingImages ? (
        <p>Loading images...</p>
      ) : (
        <div className="container">
          {allImages.map((ele, index) => (
            <Card
              key={`${ele.isSample ? 'sample' : 'uploaded'}-${ele.id}-${index}`}
              Img={ele.image_url}
              count={ele.downloads_count || 0}
              shareCount={ele.shares_count || 0}
              likeCount={ele.likes_count || 0}
              liked={likedImageIds.includes(ele.id)}
              likeBusy={busyLikeIds.includes(ele.id)}
              canLike={!ele.isSample}
              authorName={ele.author_name}
              canDelete={ele.user_id === session.user.id}
              onLike={() => handleLike(ele)}
              onDownload={() => handleDownload(ele)}
              onShare={() => handleShare(ele)}
              onDelete={() => handleDelete(ele)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default App;
