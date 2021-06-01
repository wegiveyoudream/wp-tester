import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Space, Table, Upload } from "antd";
import { database, firebaseInstance, storage } from "fbase";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {} from "./UploadFileStandard.css";

const UploadFileStandard = () => {
  const [fileObj, setFileObj] = useState(null);
  const [checkUpload, setCheckUpload] = useState("");

  const props = {
    beforeUpload: (file) => {
      // if (file.type !== "application/haansofthwp" && !file.name.includes(".hwp")) {
      if (!file.name.includes(".hwp")) {
        message.error(`${file.name} is not a hwp file`);
      }
      // return file.type === "application/haansofthwp"
      return file.name.includes(".hwp") ? true : Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      console.log("info", info);
      const fileObj = info.fileList[0]["originFileObj"];
      setFileObj(fileObj);
    },
  };

  const handleUpload = () => {
    const uploadTask = storage
      .ref("WpFile/Standard/" + fileObj.name)
      .put(fileObj);
    setCheckUpload("Uploading...");
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(percent + "% done");
      },
      (error) => {
        console.log(error);
        setCheckUpload(error.message);
      },
      () => {
        storage
          .ref("WpFile/Standard/")
          .child(fileObj.name)
          .getDownloadURL()
          .then((url) => {
            setCheckUpload("Upload successfull!!!");
            const newID = database.ref().push().key;
            writeUserData(newID, url, fileObj.name, true);
          });
      }
    );
  };
  const writeUserData = (ID, FileSrc, FileName, IsActive) => {
    firebaseInstance
      .database()
      .ref("WpDb/41/Standard/" + ID)
      .set({
        FileSrc: FileSrc,
        FileName: FileName,
        InsertTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        IsActive: IsActive,
      });
  };
  const [listURL, setListUrl] = useState();
  useEffect(() => {
    var starCountRef = database.ref("WpDb/41/Standard");
    starCountRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) setListUrl(Object.values(data));
    });
  }, []);

  const columns = [
    {
      title: "FileName",
      dataIndex: "FileName",
      key: "FileName",
      render: (text, record) => <span>{record.FileName}</span>,
    },
    {
      title: "InsertTime",
      dataIndex: "InsertTime",
      key: "InsertTime",
      render: (text, record) => <span>{record.InsertTime}</span>,
    },
    {
      title: "IsActive",
      dataIndex: "IsActive",
      key: "IsActive",
      render: (text, record) => (
        <span>{record.IsActive ? "Active" : "In Active"}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <a>Edit</a>
        </Space>
      ),
    },
  ];
  return (
    <>
      <div className="upload-file-standard">
        <div className="upload-area">
          <Upload className="upload" {...props} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload Standard File</Button>
          </Upload>
          <Button className="button" onClick={handleUpload}>
            Upload
          </Button>
          <span>{checkUpload}</span>
        </div>
        <Table columns={columns} dataSource={listURL} />
      </div>
    </>
  );
};
export default UploadFileStandard;
