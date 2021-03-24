import { Link } from "react-router-dom";

const Navigation = () => (
  <div>
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/editprofile">Edit Profile</Link>
        </li>
        <li>
          <Link to="/uploadfile">Upload File</Link>
        </li>
        <li>
          <Link to="/uploadfilestandard">Upload File Standard</Link>
        </li>
      </ul>
    </nav>
  </div>
);

export default Navigation;
