import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styles from "./app.module.scss";
import { ImageGenerator } from "./components/imageGenerator/ImageGenerator";

export const App: React.FC = () => {
  return (
    <Router>
      <nav className={styles.navbar}>
        <Link to="/">Generator</Link>
      </nav>
      <Route exact path="/" component={ImageGenerator}/>
    </Router>
  );
}
