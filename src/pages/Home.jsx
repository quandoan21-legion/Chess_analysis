import { Github, Linkedin, Trophy, BarChart3, Users } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <Trophy className="hero-icon" />
          <h1 className="hero-title">Chess.com Games Analysis</h1>
          <p className="hero-subtitle">
            Analyze thousands of chess games with detailed statistics and visualizations
          </p>
          <a
            href="https://github.com/GermanPaul12/My-Chess-Com-Games-Analyzed-and-presented-on-Streamlit"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-link"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <BarChart3 className="feature-icon" />
            <h3>Comprehensive Analysis</h3>
            <p>Detailed statistics on wins, losses, ratings, and time controls</p>
          </div>
          <div className="feature-card">
            <Trophy className="feature-icon" />
            <h3>Large Dataset</h3>
            <p>Over 3800 chess games from players of varying skill levels</p>
          </div>
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3>Custom Analysis</h3>
            <p>Analyze any Chess.com username and get personalized insights</p>
          </div>
        </div>
      </section>

      <section className="about">
        <h2 className="section-title">About This Project</h2>
        <div className="about-content">
          <p>
            This web application provides an interactive way to explore and analyze chess games
            from Chess.com. Using modern web technologies and data visualization libraries,
            it presents detailed insights into player performance, common strategies, and game patterns.
          </p>
          <p>
            The dataset is continuously updated and includes games across all time controls:
            bullet, blitz, rapid, and daily. Whether you're analyzing your own games or
            exploring patterns in chess gameplay, this tool provides the insights you need.
          </p>
        </div>
      </section>

      <section className="contributor">
        <h2 className="section-title">Contributor</h2>
        <div className="contributor-card">
          <img
            src="https://raw.githubusercontent.com/GermanPaul12/Streamlit-and-Voila-Website-Fortgeschrittene-Programmierung/master/assets/img/GP_Github.png"
            alt="German Paul"
            className="contributor-image"
          />
          <h3>German Paul</h3>
          <div className="social-links">
            <a
              href="https://github.com/GermanPaul12"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Github size={24} />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/germanpaul12/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Linkedin size={24} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
