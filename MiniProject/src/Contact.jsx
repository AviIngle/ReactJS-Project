import React, { useState } from 'react';
import Header from './Header';
import "./Pages.css";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <>
      <Header />
      <main className="site-page">
        <section className="page-hero">
          <span className="page-eyebrow">WE'RE HERE TO HELP</span>
          <h1>Contact Us</h1>
          <p>Have a question or feedback? Write your message below.</p>
        </section>
        <section className="contact-wrap">
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>Your name<input name="name" type="text" required placeholder="Enter your name" /></label>
            <label>Your email<input name="email" type="email" required placeholder="you@example.com" /></label>
            <label>Your query<textarea name="message" rows="5" required placeholder="Write your message..." /></label>
            <button type="submit">Submit message</button>
            {sent && <p className="form-notice">Your message is entered, but this demo form is not connected to email or a database yet. Contact delivery needs to be configured.</p>}
          </form>
        </section>
      </main>
    </>
  );
}
