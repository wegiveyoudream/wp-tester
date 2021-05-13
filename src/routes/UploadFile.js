import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Upload } from "antd";
import { authService, database, firebaseInstance, storage } from "fbase";
import React, { useEffect, useState } from "react";
import moment from "moment";
const { Option } = Select;

const UploadFile = () => {
  const [refWP] = useState("WpFile/");
  const [standardFileName, setStandardFileName] = useState("");
  const [listStandard, setListStandard] = useState([]);
  const [htmlResult, setHtmlResult] = useState("");

  const props = {
    beforeUpload: (file) => {
      if (!file.name.endsWith(".hwp")) {
        message.error(`${file.name} is not HWP file.`);
        return Upload.LIST_IGNORE;
      }

      if (!standardFileName) {
        message.error("Please choose standard file!");
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    onChange: (info) => {
      if (info?.event?.returnValue) {
        uploadFile(info.fileList[0]["originFileObj"]);
      }
    },
  };
  const uploadFile = (fileUpload) => {
    const uploadTask = storage
      .ref(refWP + authService.currentUser.uid + "_" + fileUpload.name)
      .put(fileUpload);

    console.log("Uploading...");
    setHtmlResult("Uploading...");

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.log(error);
        console.log(error.message);
        setHtmlResult(error.message);
      },
      () => {
        storage
          .ref(refWP)
          .child(authService.currentUser.uid + "_" + fileUpload.name)
          .getDownloadURL()
          .then((url) => {
            console.log("Checking...");
            setHtmlResult("Checking...");
            const newID = database.ref().push().key;
            writeUserData(
              authService.currentUser.uid,
              newID,
              standardFileName,
              url,
              authService.currentUser.uid + "_" + fileUpload.name,
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
        console.log(list[0].HtmlResult);
        setHtmlResult(list[0].HtmlResult);

        completedRef.remove();
      }
    });

    var standardRef = database.ref("WpDb/41/Standard");
    standardRef.on("value", (snapshot) => {
      const dataStandard = snapshot.val();
      if (dataStandard != null) {
        const list = Object.values(dataStandard).map((v) => (
          <Option value={v.FileName}>{v.FileName}</Option>
        ));
        setListStandard(list);
      }
    });
  }, []);

  function onChange(value) {
    setStandardFileName(value);
  }
  return (
    <>
      <div className="upload-page">
        <div className="upload-area">
          <Select
            showSearch
            className="select-file"
            placeholder="Choose standard file"
            onChange={onChange}
          >
            {listStandard}
          </Select>

          <Upload {...props} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload HWP</Button>
          </Upload>
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
