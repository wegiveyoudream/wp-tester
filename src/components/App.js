import React, { useState, useEffect } from "react";
import AppRouter from "./AppRouter";
import { authService } from "fbase";

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggin] = useState(false);
  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggin(true);
      } else {
        setIsLoggin(false);
      }
      setInit(true);
    });
  }, []);
  return (
    <>
      <div className="header" />
      {init ? <AppRouter isLoggedIn={isLoggedIn} /> : "Initializing...."}
      <footer className="footer">
        &copy; {new Date().getFullYear()} We give you dream
      </footer>
    </>
  );
}

export default App;
