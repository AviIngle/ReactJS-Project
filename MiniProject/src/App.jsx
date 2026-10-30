
import { useEffect, useState } from 'react';
import './App.css';

import Card from './Card';
import Header from './Header';
import Herosectio from './Herosectio';
import Auth from './Auth';
import AdminSettings from './AdminSettings';
import AdminEarnings from './AdminEarnings';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);

  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [showAdminEarnings, setShowAdminEarnings] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [likedImageIds, setLikedImageIds] = useState([]);
  const [busyLikeIds, setBusyLikeIds] = useState([]);
  const [earningRequestedIds, setEarningRequestedIds] = useState([]);

  const [settings, setSettings] = useState({
    likes_target: 100,
    downloads_target: 50,
    shares_target: 30,
    reward_amount: 100,
  });

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

  // Check whether current user is Admin
  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      setAdminChecking(true);
      setIsAdmin(false);
      setShowAdminSettings(false);
      setShowAdminEarnings(false);

      if (!session?.user?.id) {
        setAdminChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Admin check error:', error.message);
      } else {
        setIsAdmin(!!data);
      }

      setAdminChecking(false);
    };

    checkAdmin();

    return () => {
      active = false;
    };
  }, [session]);

  // Fetch Admin settings
  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('likes_target, downloads_target, shares_target, reward_amount')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Settings loading error:', error.message);
      return;
    }

    if (data) {
      setSettings(data);
    }
  };

  // Fetch images without disturbing the gallery layout
  const fetchImages = async (showLoader = false) => {
    if (showLoader) {
      setLoadingImages(true);
    }

    try {
      const { data: images, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Image loading error:', error.message);
        return;
      }

      setUploadedImages(images || []);
    } catch (error) {
      console.error('Image loading error:', error.message);
    } finally {
      if (showLoader) {
        setLoadingImages(false);
      }
    }
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

  // Fetch earning requests already submitted by this user
  const fetchEarningRequests = async () => {
    if (!session?.user?.id) return;

    const { data: requests, error } = await supabase
      .from('earning_requests')
      .select('image_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Earning requests loading error:', error.message);
      return;
    }

    setEarningRequestedIds(
      (requests || []).map((request) => request.image_id)
    );
  };

  // Load data after login
  useEffect(() => {
    if (session?.user?.id) {
      fetchImages(true);
      fetchLikedImages();
      fetchSettings();
      fetchEarningRequests();
    } else {
      setUploadedImages([]);
      setLikedImageIds([]);
      setEarningRequestedIds([]);
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

    if (file.size > 2 * 1024 * 1024) {
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

      await Promise.all([
        fetchImages(),
        fetchLikedImages(),
      ]);

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

  // Submit earning request securely through Supabase function
  const handleRequestEarning = async (image, upiId, phoneNumber) => {
    if (image.isSample) {
      alert('Sample images ke liye earning request nahi kar sakte.');
      return;
    }

    if (image.user_id !== session.user.id) {
      alert('Sirf apni uploaded image ke liye request kar sakte hain.');
      return;
    }

    if (earningRequestedIds.includes(image.id)) {
      alert('Is image ki earning request pehle se submit hai.');
      return;
    }

    if (!upiId?.trim() || !phoneNumber?.trim()) {
      alert('UPI ID aur mobile number dono enter karein.');
      return;
    }

    const phoneDigits = phoneNumber.replace(/\D/g, '');

    if (phoneDigits.length !== 10) {
      alert('Valid 10 digit mobile number enter karein.');
      return;
    }

    try {
      const { error } = await supabase.rpc(
        'request_image_earning',
        {
          p_image_id: image.id,
          p_upi_id: upiId.trim(),
          p_phone_number: phoneDigits,
        }
      );

      if (error) throw error;

      setEarningRequestedIds((previous) => [...previous, image.id]);

      alert('Earning request successfully submitted! Status: Pending.');

      await fetchEarningRequests();

    } catch (error) {
      console.error('Earning request error:', error.message);
      alert('Earning request failed: ' + error.message);
    }
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

        {isAdmin && !adminChecking && (
          <>
            <button
              type="button"
              onClick={() => setShowAdminSettings(!showAdminSettings)}
            >
              {showAdminSettings ? 'Close Admin Settings' : 'Admin Settings'}
            </button>

            <button
              type="button"
              onClick={() => setShowAdminEarnings(!showAdminEarnings)}
            >
              {showAdminEarnings
                ? 'Close Earning Dashboard'
                : 'Earning Dashboard'}
            </button>
          </>
        )}

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {showAdminSettings && isAdmin && (
        <AdminSettings
          onClose={() => {
            setShowAdminSettings(false);
            fetchSettings();
          }}
        />
      )}

      {showAdminEarnings && isAdmin && (
        <AdminEarnings
          onClose={() => setShowAdminEarnings(false)}
        />
      )}

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
          {uploadedImages.map((ele) => (
            <Card
              key={ele.id}
              Img={ele.image_url}
              count={ele.downloads_count || 0}
              shareCount={ele.shares_count || 0}
              likeCount={ele.likes_count || 0}
              liked={likedImageIds.includes(ele.id)}
              likeBusy={busyLikeIds.includes(ele.id)}
              canLike={!ele.isSample}
              authorName={ele.author_name}
              canDelete={ele.user_id === session.user.id}
              likesTarget={settings.likes_target}
              downloadsTarget={settings.downloads_target}
              sharesTarget={settings.shares_target}
              rewardAmount={settings.reward_amount}
              earningRequested={earningRequestedIds.includes(ele.id)}
              onLike={() => handleLike(ele)}
              onDownload={() => handleDownload(ele)}
              onShare={() => handleShare(ele)}
              onDelete={() => handleDelete(ele)}
              onRequestEarning={(upiId, phoneNumber) =>
                handleRequestEarning(ele, upiId, phoneNumber)
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

export default App;
