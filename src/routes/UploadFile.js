import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Upload } from "antd";
import { authService, database, firebaseInstance, storage } from "fbase";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import {} from "./UploadFile.css";
const { Option } = Select;

const UploadFile = () => {
  const [refWP] = useState("WpFile/");
  const [series, setSeries] = useState(0);
  const [standardName, setStandardName] = useState("");
  // To prevent duplicated upload
  const [fileObj, setFileObj] = useState(null);
  const [listSeries, setListSeries] = useState([]);
  const [listStandardName, setListStandardName] = useState([]);
  const [htmlResult, setHtmlResult] = useState("");

  const uploadProps = {
    beforeUpload: (file) => {
      if (!file.name.endsWith(".hwp")) {
        message.error(`${file.name} is not HWP file.`);
        return Upload.LIST_IGNORE;
      }

      if (!standardName) {
        message.error("Please choose standard file!");
        return Upload.LIST_IGNORE;
      }

      setFileObj(null);

      return true;
    },
    onChange: (info) => {
      const fileObj = info.fileList.length
        ? info.fileList[0]["originFileObj"]
        : null;
      setFileObj(fileObj);
      // if (info?.event?.returnValue && !fileObj) {
      //   const fileObj = info.fileList[0]["originFileObj"];
      //   setFileObj(fileObj);
      // }
    },
  };

  const handleUpload = () => {
    uploadFile(fileObj);
  };

  const uploadFile = (fileObj2) => {
    const uploadTask = storage
      .ref(refWP + authService.currentUser.uid + "_" + fileObj2.name)
      .put(fileObj2);

    console.log("Uploading...");
    setHtmlResult("Uploading...");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(percent + "% done");
      },
      (error) => {
        console.log(error);
        console.log(error.message);
        setHtmlResult(error.message);
      },
      () => {
        storage
          .ref(refWP)
          .child(authService.currentUser.uid + "_" + fileObj2.name)
          .getDownloadURL()
          .then((url) => {
            console.log("Checking...");
            setHtmlResult("Checking...");
            const newID = database.ref().push().key;
            writeUserData(
              authService.currentUser.uid,
              newID,
              standardName,
              url,
              authService.currentUser.uid + "_" + fileObj2.name,
              ""
            );
          });
      }
    );
  };

  const writeUserData = (
    UserID,
    ID,
    FileDestName,
    FileSrc,
    FileSrcName,
    HtmlResult
  ) => {
    firebaseInstance
      .database()
      .ref("WpDb/41/ListPending/" + UserID + "/" + ID)
      .set({
        FileDestName: FileDestName,
        FileSrc: FileSrc,
        FileSrcName: FileSrcName,
        InsertTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        HtmlResult: HtmlResult,
      });
  };

  useEffect(() => {
    var completedRef = database.ref(
      "WpDb/41/ListCompleted/" + authService.currentUser.uid
    );
    completedRef.on("value", (snapshot) => {
      // FileDestName, FileSrcName, InsertTime
      const data = snapshot.val();
      if (data != null) {
        const list = Object.values(data);
        console.log("Completed.");
        setHtmlResult(list[0].HtmlResult);

        completedRef.remove();
      }
    });

    var seriesRef = database.ref("WpDb/Series");
    seriesRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const list = Object.entries(data)
          .reverse()
          .map((kv) => (
            <Option key={kv[0]} value={kv[0]}>
              {kv[1]}
            </Option>
          ));
        setListSeries(list);
      }
    });

    var standardRef = database.ref("WpDb/41/Standard");
    standardRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const list = Object.values(data).map((v) => (
          <Option key={v.FileName} value={v.FileName}>
            {v.FileName}
          </Option>
        ));
        setListStandardName(list);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (fileObj) {
  //     uploadFile(fileObj);
  //   }
  // }, [uploadFile, fileObj]);

  function onChangeSeries(value) {
    setSeries(value);
  }
  function onChangeStandard(value) {
    setStandardName(value);
  }

  return (
    <>
      <div className="upload-file">
        <div className="upload-area">
          <Select
            showSearch
            className="select-series"
            placeholder="Choose series"
            onChange={onChangeSeries}
          >
            {listSeries}
          </Select>
          <Select
            showSearch
            className="select-standard"
            placeholder="Choose standard file"
            onChange={onChangeStandard}
          >
            {listStandardName}
          </Select>

          <Upload className="select" {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select HWP</Button>
          </Upload>
          <Button disabled={!fileObj} className="upload" onClick={handleUpload}>
            Upload
          </Button>
        </div>
        <div
          className="html-result"
          dangerouslySetInnerHTML={{ __html: htmlResult }}
        />
      </div>
    </>
  );
};
export default UploadFile;
