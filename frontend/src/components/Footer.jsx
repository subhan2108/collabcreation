

export default function Footer() {
  return (
    <footer className="footer glass">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Collab<span>Creation</span></h3>
          <p>Empowering brands and creators to collaborate with trust and transparency.</p>
        </div>

        <div className="footer-links">
          <a href="#hero">Home</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#signup">Sign Up</a>
        </div>

        <div className="footer-socials">
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} CollabCreation. All rights reserved.
      </div>
    </footer>
  );
}
