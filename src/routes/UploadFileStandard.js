import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Space, Table, Upload, Select } from "antd";
import { database, firebaseInstance, storage } from "fbase";
import React, { useEffect, useState } from "react";
import moment from "moment";
import SelectSeries from "../components/SelectSeries";
import {} from "./UploadFileStandard.css";
const { Option } = Select;

const UploadFileStandard = () => {
  const [seriesSeq, setSeriesSeq] = useState(
    process.env.REACT_APP_DEFAULT_SERIES_SEQ
  );
  const [optionsSeries, setOptionsSeries] = useState([]);
  const [fileObj, setFileObj] = useState(null);
  const [checkUpload, setCheckUpload] = useState("");
  const [listStandard, setListStandard] = useState();

  const uploadProps = {
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
      .ref(`WpFile/${seriesSeq}/Standard/` + fileObj.name)
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
          .ref(`WpFile/${seriesSeq}/Standard/`)
          .child(fileObj.name)
          .getDownloadURL()
          .then((url) => {
            setCheckUpload("Upload successfull.");
            const newID = database.ref().push().key;
            writeUserData(newID, url, fileObj.name);
          });
      }
    );
  };
  const writeUserData = (ID, FileSrc, FileName) => {
    firebaseInstance
      .database()
      .ref(`WpDb/${seriesSeq}/Standard/` + ID)
      .set({
        FileSrc: FileSrc,
        FileName: FileName,
        InsertTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
  };

  useEffect(() => {
    var seriesRef = database.ref("WpDb/Series");
    seriesRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const options = Object.entries(data)
          .reverse()
          .map((kv) => ({ value: kv[0], label: kv[1] }));
        setOptionsSeries(options);
      }
    });
  }, []);

  useEffect(() => {
    var starCountRef = database.ref(`WpDb/${seriesSeq}/Standard`);
    starCountRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setListStandard(data ? Object.values(data) : []);
    });
  }, [seriesSeq]);

  function onChangeSeries(value) {
    setSeriesSeq(value);
  }

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
          <SelectSeries
            className="select-series"
            options={optionsSeries}
            defaultValue={process.env.REACT_APP_DEFAULT_SERIES_SEQ}
            onChange={onChangeSeries}
          />
          <Upload className="select" {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select Standard File</Button>
          </Upload>
          <Button className="upload" onClick={handleUpload}>
            Upload
          </Button>
          <span>{checkUpload}</span>
        </div>
        <Table columns={columns} dataSource={listStandard} />
      </div>
    </>
  );
};
export default UploadFileStandard;
