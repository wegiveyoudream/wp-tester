import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Select, Space, Table, Upload } from "antd";
import { authService, database, firebaseInstance, storage } from "fbase";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
const { Option } = Select;

const UploadFile = () => {
  const [refWP] = useState("WpFile/");
  const [standardFileName, setStandardFileName] = useState("");
  // To prevent duplicated upload
  const [fileObj, setFileObj] = useState(null);
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

      setFileObj(null);

      return true;
    },
    onChange: (info) => {
      console.log("info", info);
      if (info?.event?.returnValue && !fileObj) {
        const fileObj = info.fileList[0]["originFileObj"];
        setFileObj(fileObj);
        // uploadFile(fileObj);
      }
    },
  };

  const uploadFile = useCallback(
    (fileObj2) => {
      const uploadTask = storage
        .ref(refWP + authService.currentUser.uid + "_" + fileObj2.name)
        .put(fileObj2);

      console.log("Uploading...");
      setHtmlResult("Uploading...");

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
                standardFileName,
                url,
                authService.currentUser.uid + "_" + fileObj2.name,
                ""
              );
            });
        }
      );
    },
    [refWP, standardFileName]
  );
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

    var standardRef = database.ref("WpDb/41/Standard");
    standardRef.on("value", (snapshot) => {
      const dataStandard = snapshot.val();
      if (dataStandard != null) {
        const list = Object.values(dataStandard).map((v) => (
          <Option key={v.FileName} value={v.FileName}>
            {v.FileName}
          </Option>
        ));
        setListStandard(list);
      }
    });
  }, []);

  useEffect(() => {
    if (fileObj) {
      uploadFile(fileObj);
    }
  }, [uploadFile, fileObj]);

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
