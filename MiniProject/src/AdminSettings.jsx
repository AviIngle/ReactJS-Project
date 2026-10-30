
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function AdminSettings({ onClose }) {
  const [settings, setSettings] = useState({
    likes_target: 100,
    downloads_target: 50,
    shares_target: 30,
    reward_amount: 100,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        alert('Settings load error: ' + error.message);
      } else if (data) {
        setSettings({
          likes_target: data.likes_target,
          downloads_target: data.downloads_target,
          shares_target: data.shares_target,
          reward_amount: data.reward_amount,
        });
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Update input values
  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save settings
  const handleSave = async (event) => {
    event.preventDefault();

    const likes = Number(settings.likes_target);
    const downloads = Number(settings.downloads_target);
    const shares = Number(settings.shares_target);
    const reward = Number(settings.reward_amount);

    if (
      !Number.isInteger(likes) || likes < 1 ||
      !Number.isInteger(downloads) || downloads < 1 ||
      !Number.isInteger(shares) || shares < 1 ||
      !Number.isFinite(reward) || reward < 0
    ) {
      alert('Please enter valid targets and reward amount.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('app_settings')
      .update({
        likes_target: likes,
        downloads_target: downloads,
        shares_target: shares,
        reward_amount: reward,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    setSaving(false);

    if (error) {
      alert('Settings save error: ' + error.message);
    } else {
      alert('Settings successfully updated!');
    }
  };

  if (loading) {
    return <p>Loading admin settings...</p>;
  }

  return (
    <section className="admin-settings">
      <h2>Admin Settings</h2>
      <p>Set your earning milestones and reward amount.</p>

      <form onSubmit={handleSave}>
        <label>
          Likes Target
          <input
            type="number"
            name="likes_target"
            min="1"
            value={settings.likes_target}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Downloads Target
          <input
            type="number"
            name="downloads_target"
            min="1"
            value={settings.downloads_target}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Shares Target
          <input
            type="number"
            name="shares_target"
            min="1"
            value={settings.shares_target}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Reward Amount (₹)
          <input
            type="number"
            name="reward_amount"
            min="0"
            step="0.01"
            value={settings.reward_amount}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        <button type="button" onClick={onClose}>
          Close
        </button>
      </form>
    </section>
  );
}

export default AdminSettings;
