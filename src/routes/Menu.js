import { Button, Menu } from "antd";
import "antd/dist/antd.css";
import { authService, database } from "fbase";
import React, {useEffect, useState} from "react";
import { useHistory } from "react-router-dom";

const Slider = () => {
  let history = useHistory();
  const handleClick = (e) => {
    if (e.key === "/logout") {
      logout();
    } else history.push(e.key);
  };
  const logout = () => {
    authService
      .signOut()
      .then(function () {
        history.push("/");
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    var starCountRef = database.ref("wpdb/UserRole");
    starCountRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const listUserAdmin = Object.values(data);
        listUserAdmin.map((item,i)=>{
          if(authService.currentUser.email === item){
            setIsAdmin(true);
          }
        })
      }
    });
  }, []);
  return (
    <Menu
      onClick={handleClick}
      className="menu"
      // style={{ width:  }}
      defaultSelectedKeys={["/"]}
      mode="inline"
    >
      {/* <Menu.Item key="/">Home</Menu.Item> */}
      {/* <Menu.Item key="/profile">Profile</Menu.Item> */}
      <Menu.Item key="/uploadfile">Upload File</Menu.Item>
      {isAdmin ? <Menu.Item key="/uploadfilestandard">Upload File Standard</Menu.Item> : null}
      
      <Menu.Item key="/logout">
        <Button type="primary" block>
          Logout
        </Button>
      </Menu.Item>
    </Menu>
  );
};
export default Slider;
