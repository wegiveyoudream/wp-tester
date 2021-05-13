import {
  GithubFilled,
  GooglePlusSquareFilled,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import "antd/dist/antd.css";
import { authService, firebaseInstance } from "fbase";
import React, { useState } from "react";
import "../index.css";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const [isNewAccount, setNewAccount] = useState(true);
  const [error, setError] = useState("");
  const onChange = (event) => {
    const {
      target: { name, value },
    } = event;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassWord(value);
    }
  };
  const onSubmit = async (event) => {
    // event.preventDefault();
    try {
      let data;
      if (isNewAccount) {
        data = await authService.signInWithEmailAndPassword(email, passWord);
      } else {
        data = await authService.createUserWithEmailAndPassword(
          email,
          passWord
        );
      }
      console.log(data);
    } catch (error) {
      setError(error.message);
    }
  };
  const toggleAccount = () => setNewAccount((prev) => !prev);
  const onSocialClick = async (name) => {
    let provider;
    if (name === "google") {
      provider = new firebaseInstance.auth.GoogleAuthProvider();
    } else if (name === "github") {
      provider = new firebaseInstance.auth.GithubAuthProvider();
    }
    const data = await authService.signInWithPopup(provider);
    console.log(data);
  };
  return (
    <div className="login-form">
      <Form onFinish={onSubmit}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your Username!",
            },
          ]}
        >
          <Input
            name="email"
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
            value={email}
            onChange={onChange}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            name="password"
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
            value={passWord}
            onChange={onChange}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            {isNewAccount === false ? "Create new account" : "Log In"}
          </Button>
          <a onClick={toggleAccount} className="sign-up-link">
            {isNewAccount ? "Sign up here" : "Sign in here"}
          </a>
        </Form.Item>
      </Form>
      <span className="text-error">{error}</span>
      <span>Or sign in with</span>
      <div className="login-social">
        <Button
          icon={<GooglePlusSquareFilled />}
          name="google"
          onClick={() => onSocialClick("google")}
          type="primary"
          danger
        >
          Google
        </Button>
        <Button
          icon={<GithubFilled />}
          name="github"
          onClick={() => onSocialClick("github")}
        >
          Github
        </Button>
      </div>
    </div>
  );
};
export default Auth;
