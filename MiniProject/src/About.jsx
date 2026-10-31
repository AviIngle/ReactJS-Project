import React from 'react';
import Header from './Header';
import "./Pages.css";

export default function About() {
  return (
    <>
      <Header />
      <main className="site-page">
        <section className="page-hero">
          <span className="page-eyebrow">ABOUT OUR PLATFORM</span>
          <h1>Share moments. Build a creative community.</h1>
          <p>A place to upload status images, discover creative posts and share them with others.</p>
        </section>
        <section className="page-content">
          <h2>What this website does</h2>
          <p>Our platform lets registered members upload status images. Visitors can view, like, share and download images. Image owners can track engagement and submit an earning request when the targets set by the administrator are completed.</p>
          <div className="page-feature-grid">
            <article><h3>Share creativity</h3><p>Publish images and let other people discover them.</p></article>
            <article><h3>Track progress</h3><p>See likes, shares and downloads for your uploaded images.</p></article>
            <article><h3>Clear review process</h3><p>Earning requests are submitted for administrator review. Approval is not automatic.</p></article>
          </div>
        </section>
      </main>
    </>
  );
}
