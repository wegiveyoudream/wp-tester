import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import EditProfile from "routes/EditProfile";
import Profile from "routes/Profile";
import UploadFile from "routes/UploadFile";
import Auth from "../routes/Auth";
import Menu from "../routes/Menu";
import UploadFileStandard from "routes/UploadFileStandard";

const AppRouter = ({ isLoggedIn }) => {
  console.log(isLoggedIn ? "login success" : "login false");
  return (
    <Router>
      {/* {isLoggedIn && <Navigation />} */}

      <Switch>
        {isLoggedIn === true ? (
          <>
            <div className="banner"></div>
            <Menu />

            <Route exact path="/">
              <UploadFile isLoggedIn={isLoggedIn} />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/editprofile">
              <EditProfile />
            </Route>
            <Route exact path="/uploadfile">
              <UploadFile isLoggedIn={isLoggedIn} />
            </Route>
            <Route exact path="/uploadfilestandard">
              <UploadFileStandard />
            </Route>
            {/* <button onClick={testClick}>logout</button> */}
          </>
        ) : (
          <Route exact path="/">
            <Auth />
          </Route>
        )}
      </Switch>
    </Router>
  );
};

export default AppRouter;
