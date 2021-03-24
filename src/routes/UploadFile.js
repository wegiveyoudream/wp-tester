import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Upload } from "antd";
import { authService, database, firebaseInstance, storage } from "fbase";
import React, { useEffect, useState } from "react";
import moment from "moment";

const UploadFile = () => {
  const [fileUpload, setFileUpload] = useState(null);
  const [checkUpload, setCheckUpload] = useState("");
  const [refWP, setRefWP] = useState("WP/");
  const [standardFileName, setStandardFileName] = useState("");
  const props = {
    beforeUpload: (file) => {
      if (!file.name.includes(".hwp")) {
        message.error(`${file.name} is not a hwp file`);
      }
      // return file.type === "application/haansofthwp"
      return file.name.includes(".hwp") ? true : Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      setFileUpload(info.fileList[0]["originFileObj"]);
    },
  };
  const handleUpload = () => {
    if (standardFileName === "") {
      setCheckUpload("Please choose standard file!");
    } else {
      setRefWP("WP/");
      const uploadTask = storage.ref(refWP + fileUpload.name).put(fileUpload);
      setCheckUpload("Uploading....");
      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.log(error);
          setCheckUpload(error.message);
        },
        () => {
          storage
            .ref(refWP)
            .child(fileUpload.name)
            .getDownloadURL()
            .then((url) => {
              setCheckUpload("Upload successfull!!!");
              const newID = database.ref().push().key;
              writeUserData(
                authService.currentUser.uid,
                newID,
                standardFileName,
                url,
                fileUpload.name,
                "<b>File is processing</b>",
                "Pending"
              );
            });
        }
      );
    }
  };
  const writeUserData = (
    UserID,
    ID,
    FileDestName,
    FileSrc,
    FileSrcName,
    HtmlResult,
    Status
  ) => {
    firebaseInstance
      .database()
      .ref("wpdb/ListPending/" + UserID + "/" + ID)
      .set({
        FileDestName: FileDestName,
        FileSrc: FileSrc,
        FileSrcName: FileSrcName,
        HtmlResult: HtmlResult,
        Status: Status,
        InsertTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
  };

  const [listURL, setListUrl] = useState();
  const [htmlResult, setHtmlResult] = useState("");
  useEffect(() => {
    var starCountRef = database.ref(
      "wpdb/ListPending/" + authService.currentUser.uid
    );
    starCountRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) setListUrl(Object.values(data));
    });
  }, []);

  const createMarkup = (htmlResult) => {
    setHtmlResult(htmlResult.HtmlResult);
  };
  const columns = [
    {
      title: "FileSrcName",
      dataIndex: "FileDestName",
      key: "FileSrcName",
      render: (text, record) => <span>{record.FileSrcName}</span>,
    },
    {
      title: "FileDestName",
      dataIndex: "FileDestName",
      key: "FileDestName",
      render: (text, record) => <span>{record.FileDestName}</span>,
    },
    {
      title: "InsertTime",
      dataIndex: "InsertTime",
      key: "InsertTime",
      render: (text, record) => <span>{record.InsertTime}</span>,
    },
    {
      title: "IsComplete",
      dataIndex: "IsComplete",
      key: "IsComplete",
      render: (text, record) => (
        <span>{record.IsComplete ? "Completed" : "Running"}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <a onClick={() => createMarkup(record)}>Show HTML Result</a>
        </Space>
      ),
    },
  ];
  const { Option } = Select;

  const listStandard = [];
  var standardRef = database.ref("wpdb/standard");
  standardRef.on("value", (snapshot) => {
    const dataStandard = snapshot.val();
    if (dataStandard != null) {
      const listFileStandard = Object.values(dataStandard);
      for (let i = 0; i < listFileStandard.length; i++) {
        listStandard.push(
          <Option value={listFileStandard[i].FileName}>
            {listFileStandard[i].FileName}
          </Option>
        );
      }
    }
  });
  function onChange(value) {
    setStandardFileName(value);
  }
  return (
    <>
      <div className="upload-page">
        <div className="upload-area">
          <Upload {...props} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload hwp only</Button>
          </Upload>
          <Button onClick={handleUpload}>Upload</Button>
          <Select
            showSearch
            className="select-file"
            placeholder="Choose standard file"
            onChange={onChange}
          >
            {listStandard}
          </Select>
          <span>{checkUpload}</span>
        </div>
        <Table columns={columns} dataSource={listURL} />
        <div
          className="html-result"
          dangerouslySetInnerHTML={{ __html: htmlResult }}
        />
      </div>
    </>
  );
};
export default UploadFile;
