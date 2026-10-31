
import { useEffect, useState } from "react";
import Header from "./Header";
import { supabase } from "./supabase";
import "./Pages.css";

const services = [
  ["🖼️", "Image uploads", "Registered members can upload their own status images."],
  ["❤️", "Likes and engagement", "Visitors can like images and see engagement counts."],
  ["🔗", "Sharing", "Share an image link with friends and other people."],
  ["📥", "Downloads", "Download images that are available in the gallery."],
  ["💰", "Earning requests", "Submit a reward request after meeting all targets. Requests are reviewed by the administrator."],
];

export default function Services() {
  const [settings, setSettings] = useState({
    likes_target: 0,
    shares_target: 0,
    downloads_target: 0,
    reward_amount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("likes_target, shares_target, downloads_target, reward_amount")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Settings error:", error.message);
      setSettingsError("Unable to load current earning targets.");
    } else if (data) {
      setSettings(data);
    }

    setLoading(false);
  };

  return (
    <>
      <Header />

      <main className="site-page services-page">

        {/* HERO */}
        <section className="services-hero">
          <div className="services-hero-overlay">
            <div className="services-hero-content">
              <span className="services-kicker">CREATE • SHARE • EARN</span>
              <h1>Turn Your Creativity Into Rewards</h1>
              <p>
                Upload your favourite status images, grow genuine engagement
                and unlock earning opportunities with My Gallery.
              </p>
              <a href="#services-overview" className="services-hero-btn">
                Explore Our Services <span>↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="services-overview" id="services-overview">
          <div className="services-container">
            <div className="services-intro">
              <span className="services-kicker dark-kicker">WHAT WE OFFER</span>
              <h2>Everything You Need to Share Your Creativity</h2>
              <p>
                Simple tools to upload, discover, share and earn through
                your image gallery.
              </p>
            </div>

            <div className="services-list">
              {services.map(([icon, title, description], index) => (
                <article className="service-row" key={title}>
                  <span className="service-row-number">
                    0{index + 1}
                  </span>
                  <span className="service-row-icon">{icon}</span>
                  <div className="service-row-content">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <span className="service-row-arrow">↗</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PARALLAX IMAGE SECTION */}
        <section className="services-parallax">
          <div className="services-parallax-overlay">
            <div className="services-parallax-content">
              <span className="services-kicker">YOUR CREATIVITY MATTERS</span>
              <h2>Every Image Has a Story. Let Yours Be Seen.</h2>
              <p>
                Share original content, build engagement and take the next
                step towards earning through your creativity.
              </p>
            </div>
          </div>
        </section>

        {/* HOW TO EARN */}
        <section className="services-how">
          <div className="services-container">
            <div className="services-intro">
              <span className="services-kicker dark-kicker">YOUR JOURNEY</span>
              <h2>How Can You Earn?</h2>
              <p>Follow these six steps to submit an earning request.</p>
            </div>

            <div className="earning-timeline">
              {[
                ["01", "Create an Account", "Register or log in to your My Gallery account."],
                ["02", "Upload Your Image", "Upload your own image to the gallery."],
                ["03", "Get Engagement", "Encourage genuine likes, shares and downloads."],
                ["04", "Complete All Targets", "Reach all three required engagement targets."],
                ["05", "Submit Your Request", "Enter your valid UPI ID and phone number."],
                ["06", "Admin Review", "Your request will be reviewed before payment."],
              ].map(([number, title, description]) => (
                <article className="timeline-item" key={number}>
                  <span className="timeline-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CURRENT TARGETS */}
        <section className="services-target-section">
          <div className="services-container">
            <div className="services-intro">
              <span className="services-kicker">KNOW YOUR GOALS</span>
              <h2>Current Earning Targets</h2>
              <p>
                Live target values configured by the administrator.
              </p>
            </div>

            {loading ? (
              <p className="services-message">Loading current targets...</p>
            ) : settingsError ? (
              <p className="services-message error-message">{settingsError}</p>
            ) : (
              <div className="premium-target-grid">
                <article className="premium-target">
                  <span>❤️</span>
                  <p>Required Likes</p>
                  <strong>{settings.likes_target}</strong>
                  <small>Per image</small>
                </article>

                <article className="premium-target">
                  <span>🔗</span>
                  <p>Required Shares</p>
                  <strong>{settings.shares_target}</strong>
                  <small>Per image</small>
                </article>

                <article className="premium-target">
                  <span>📥</span>
                  <p>Required Downloads</p>
                  <strong>{settings.downloads_target}</strong>
                  <small>Per image</small>
                </article>

                <article className="premium-target reward-target">
                  <span>💰</span>
                  <p>Reward Amount</p>
                  <strong>₹{Number(settings.reward_amount).toFixed(2)}</strong>
                  <small>Per eligible request</small>
                </article>
              </div>
            )}
          </div>
        </section>

        {/* CHECK TARGETS */}
        <section className="services-check-section">
          <div className="services-container">
            <div className="services-intro">
              <span className="services-kicker dark-kicker">STAY ON TRACK</span>
              <h2>Check Your Progress</h2>
              <p>Keep track of your image performance and earning requests.</p>
            </div>

            <div className="progress-feature">
              <div className="progress-feature-visual">
                <span>01 / 03</span>
                <div className="progress-visual-icon">📊</div>
                <h3>Your Image Performance</h3>
              </div>

              <div className="progress-feature-text">
                <article>
                  <span>01</span>
                  <div>
                    <h3>Check Image Statistics</h3>
                    <p>Open your uploaded image and check its current likes, shares and downloads.</p>
                  </div>
                </article>

                <article>
                  <span>02</span>
                  <div>
                    <h3>Compare Your Targets</h3>
                    <p>Compare all three engagement counts with the current targets. All three must be completed.</p>
                  </div>
                </article>

                <article>
                  <span>03</span>
                  <div>
                    <h3>Check Earning Requests</h3>
                    <p>Visit the earning section of your account to check your submitted request status.</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT STATUS */}
        <section className="services-status-section">
          <div className="services-container">
            <div className="services-intro">
              <span className="services-kicker dark-kicker">PAYMENT PROCESS</span>
              <h2>Understand Your Request Status</h2>
              <p>Know what each status means after submitting your request.</p>
            </div>

            <div className="status-grid">
              <article className="status-item pending-status">
                <span className="status-indicator"></span>
                <div>
                  <h3>Pending</h3>
                  <p>Your request is waiting for admin review.</p>
                </div>
              </article>

              <article className="status-item approved-status">
                <span className="status-indicator"></span>
                <div>
                  <h3>Approved</h3>
                  <p>Your request is approved and awaiting payment completion.</p>
                </div>
              </article>

              <article className="status-item rejected-status">
                <span className="status-indicator"></span>
                <div>
                  <h3>Rejected</h3>
                  <p>Your request was not approved by the administrator.</p>
                </div>
              </article>

              <article className="status-item completed-status">
                <span className="status-indicator"></span>
                <div>
                  <h3>Payment Done</h3>
                  <p>The administrator has marked your payment as completed.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* GUIDELINES */}
        <section className="services-guidelines-section">
          <div className="services-container guidelines-layout">
            <div className="guidelines-heading">
              <span className="services-kicker">BEFORE YOU START</span>
              <h2>A Few Important Guidelines</h2>
              <p>
                Follow these simple guidelines to keep your experience
                smooth and fair.
              </p>
            </div>

            <ul className="guidelines-list">
              <li>Upload images that you own or have permission to share.</li>
              <li>Encourage genuine likes, shares and downloads.</li>
              <li>Complete all three targets before requesting earnings.</li>
              <li>Enter a correct UPI ID and phone number.</li>
              <li>Check your existing request before submitting another one.</li>
              <li>Keep checking your earning request status.</li>
              <li>Targets and reward amounts may change when settings are updated.</li>
            </ul>
          </div>
        </section>

        {/* FINAL NOTE */}
        <section className="services-final-note">
          <div className="services-container">
            <span>PLEASE NOTE</span>
            <p>
              Rewards depend on the targets and amount configured by the
              administrator. Submitting a request does not guarantee
              approval or payment.
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
