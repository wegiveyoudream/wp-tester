import { UploadOutlined } from "@ant-design/icons";
import { Button, Alert, Select, Upload, Tabs } from "antd";
import { authService, databaseOther, storageOther } from "fbase";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {} from "./UploadFile.css";
import { standards, seriesList } from "data";

const { TabPane } = Tabs;

const ElapsedTimer = ({ onElapse }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      const seconds = secondsElapsed + 1;
      setSecondsElapsed(seconds);
      onElapse(seconds);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [onElapse, secondsElapsed]);

  return <></>;
};

const UploadFile = () => {
  const wpFileUserRoot = `WpFile/${process.env.REACT_APP_DEFAULT_SERIES_SEQ}/User/`;
  // To prevent duplicated upload
  const [fileObj, setFileObj] = useState(null);
  const [seriesSeq, setSeriesSeq] = useState(
    process.env.REACT_APP_DEFAULT_SERIES_SEQ
  );
  const [optionsSeries, setOptionsSeries] = useState([]);
  const [standardName, setStandardName] = useState("");
  const [optionsStandardName, setOptionsStandardName] = useState([]);
  const [resultJson, setResultJson] = useState({});
  // {Point:-208.0,Groups:[{Name:"Input",Description:"입력",Point:172.0,Content:"xxx",Items:[{Name:"DictationChar",Description:"입력(글자)",Point:348.0,Content:"xxx",},{Name:"DictationWord",Description:"입력(단어)",Point:132.0,Content:"xxx",},{Name:"Rectangle",Description:"글상자",Point:11.0,Content:"xxx",},{Name:"Title1",Description:"제목(1)",Point:15.0,Content:"xxx",},{Name:"Title2",Description:"제목(2)",Point:0.0,Content:"xxx",},{Name:"Field",Description:"누름틀",Point:0.0,Content:"xxx",},{Name:"Bookmark",Description:"책갈피",Point:0.0,Content:"xxx",},{Name:"Picture",Description:"그림",Point:3.0,Content:"xxx",},{Name:"FootNote",Description:"각주",Point:6.0,Content:"xxx",},{Name:"Hyperlink",Description:"하이퍼링크",Point:5.0,Content:"xxx",},],},{Name:"Shape",Description:"모양",Point:48.0,Content:"xxx",Items:[{Name:"PageDef",Description:"편집 용지",Point:0.0,Content:"xxx",},{Name:"ColDef",Description:"단 설정",Point:0.0,Content:"xxx",},{Name:"PageBorder",Description:"쪽 테두리",Point:3.0,Content:"xxx",},{Name:"ParagraphAlign",Description:"문단 정렬",Point:0.0,Content:"xxx",},{Name:"FirstChar",Description:"문단 첫 글자 장식",Point:9.0,Content:"xxx",},{Name:"NumberHeadingType",Description:"문단 번호",Point:0.0,Content:"xxx",},{Name:"Style",Description:"스타일",Point:15.0,Content:"xxx",},{Name:"Header",Description:"머리말",Point:9.0,Content:"xxx",},{Name:"Footer",Description:"꼬리말",Point:9.0,Content:"xxx",},{Name:"PageNum",Description:"쪽 번호",Point:3.0,Content:"xxx",},],},{Name:"Table",Description:"표",Point:83.0,Content:"xxx",Items:[{Name:"Table",Description:"표",Point:71.0,Content:"xxx",},{Name:"BlockFormula",Description:"블록 계산식",Point:9.0,Content:"xxx",},{Name:"TableCaption",Description:"캡션",Point:3.0,Content:"xxx",},],},{Name:"Chart",Description:"차트",Point:5.0,Content:"xxx",Items:[{Name:"Chart",Description:"차트",Point:5.0,Content:"xxx",},],},],}
  const [message, setMessage] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);

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

      return false;
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
    const uploadTask = storageOther
      .ref(wpFileUserRoot + authService.currentUser.uid + "_" + fileObj2.name)
      .put(fileObj2);

    console.log("Uploading...");
    setMessage("Uploading...");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(percent + "% done");
      },
      (error) => {
        console.log(error);
        console.log(error.message);
        setMessage(error.message);
      },
      () => {
        storageOther
          .ref(wpFileUserRoot)
          .child(authService.currentUser.uid + "_" + fileObj2.name)
          .getDownloadURL()
          .then((url) => {
            console.log("Checking...");
            setMessage("Checking...");
            const newID = databaseOther.ref().push().key;
            writeUserData(
              authService.currentUser.uid,
              newID,
              standardName,
              authService.currentUser.uid + "_" + fileObj2.name,
              url,
              ""
            );
          });
      }
    );
  };

  const writeUserData = (UserID, ID, FileNameStandard, FileName, FullPath) => {
    databaseOther
      .ref(`WpDb/${seriesSeq}/ListPending/` + UserID + "/" + ID)
      .set({
        FileNameStandard: FileNameStandard,
        FileName: FileName,
        FullPath: FullPath,
        InsertTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
  };

  useEffect(() => {
    const deleteFile = (fileName) => {
      storageOther
        .ref(wpFileUserRoot)
        .child(fileName)
        .delete()
        .then(() => {
          console.log(`${fileName} deleted.`);
        })
        .catch((error) => {
          console.log(`${fileName}:`, error);
        });
    };

    const completedRef = databaseOther.ref(
      `WpDb/${seriesSeq}/ListCompleted/` + authService.currentUser.uid
    );
    completedRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        const list = Object.values(data);
        const item = list[0];
        console.log("Completed.");

        try {
          const json = JSON.parse(item.ResultJson);
          setMessage("");
          setResultJson(json);
          console.log(json);
        } catch (e) {
          setMessage(item.ResultJson);
          setResultJson({});
        }

        deleteFile(item.FileName);
        completedRef.remove();
      }
    });

    const options = standards[seriesSeq].map((v) => ({ value: v, label: v }));
    setOptionsStandardName(options);
    setStandardName(options.length ? options[0].value : "");
  }, [seriesSeq, wpFileUserRoot]);

  useEffect(() => {
    const options = seriesList;
    setOptionsSeries(options);
    if (options.length) {
      setSeriesSeq(options[0].value);
    }
  }, []);

  // useEffect(() => {
  //   if (fileObj) {
  //     uploadFile(fileObj);
  //   }
  // }, [uploadFile, fileObj]);

  function onChangeSeries(value) {
    console.log("onChangeSeries", value);
    setSeriesSeq(value);
  }
  function onChangeStandard(value) {
    setStandardName(value);
  }

  function getTabText(Description, Point) {
    if (Point === 0) {
      return Description;
    } else {
      const text = `${Description} <${Point}>`;
      return <span className="wp_value_wrong">{text}</span>;
    }
  }

  return (
    <>
      <div className="upload-file">
        <div className="upload-area">
          <Select
            className="select-series"
            placeholder="Choose series"
            onChange={onChangeSeries}
            defaultValue={process.env.REACT_APP_DEFAULT_SERIES_SEQ}
            value={seriesSeq}
            options={optionsSeries}
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
        <div className="tab-area">
          {message && (
            <>
              <ElapsedTimer
                onElapse={(seconds) => setSecondsElapsed(seconds)}
              />
              <Alert message={`${secondsElapsed} ${message}`} />
            </>
          )}

          {resultJson?.Point && (
            <h3>
              Point:
              <span
                className={
                  resultJson.Point >= 80 ? "wp_value" : "wp_value_wrong"
                }
              >
                {resultJson.Point}
              </span>
            </h3>
          )}
          <Tabs size="small">
            {resultJson?.Groups?.map((group) => (
              <TabPane
                tab={getTabText(group.Description, group.Point)}
                key={group.Name}
              >
                <Tabs size="small">
                  {group.Items.map((item) => (
                    <TabPane
                      tab={getTabText(item.Description, item.Point)}
                      key={item.Name}
                    >
                      <div
                        className="html-result"
                        dangerouslySetInnerHTML={{ __html: item.Content }}
                      />
                    </TabPane>
                  ))}
                </Tabs>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
};
export default UploadFile;
