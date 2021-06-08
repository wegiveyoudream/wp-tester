import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Upload } from "antd";
import { authService, database, firebaseInstance, storage } from "fbase";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import SelectSeries from "../components/SelectSeries";
import {} from "./UploadFile.css";
const { Option } = Select;

const UploadFile = () => {
  const [wpFileUserRoot] = useState(
    `WpFile/${process.env.REACT_APP_DEFAULT_SERIES_SEQ}/User/`
  );
  // To prevent duplicated upload
  const [fileObj, setFileObj] = useState(null);
  const [seriesSeq, setSeriesSeq] = useState(
    process.env.REACT_APP_DEFAULT_SERIES_SEQ
  );
  const [optionsSeries, setOptionsSeries] = useState([]);
  const [standardName, setStandardName] = useState("");
  const [optionsStandardName, setOptionsStandardName] = useState([]);
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
      .ref(wpFileUserRoot + authService.currentUser.uid + "_" + fileObj2.name)
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
          .ref(wpFileUserRoot)
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
      .ref(`WpDb/${seriesSeq}/ListPending/` + UserID + "/" + ID)
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
      `WpDb/${seriesSeq}/ListCompleted/` + authService.currentUser.uid
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

    var standardRef = database.ref(`WpDb/${seriesSeq}/Standard`);
    standardRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const options = Object.values(data).map((v) => ({
          value: v.FileName,
          label: v.FileName,
        }));
        setOptionsStandardName(options);
        setStandardName(options.length ? options[0].value : "");
      }
    });
  }, [seriesSeq]);

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

  // useEffect(() => {
  //   if (fileObj) {
  //     uploadFile(fileObj);
  //   }
  // }, [uploadFile, fileObj]);

  function onChangeSeries(value) {
    setSeriesSeq(value);
  }
  function onChangeStandard(value) {
    setStandardName(value);
  }

  return (
    <>
      <div className="upload-file">
        <div className="upload-area">
          <SelectSeries
            className="select-series"
            options={optionsSeries}
            defaultValue={process.env.REACT_APP_DEFAULT_SERIES_SEQ}
            onChange={onChangeSeries}
          />
          <Select
            showSearch
            className="select-standard"
            placeholder="Choose standard file"
            value={standardName}
            options={optionsStandardName}
            onChange={onChangeStandard}
          />

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
