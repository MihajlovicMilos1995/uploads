import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import "../styles/StudentUpload.css";
import axios from "../api/axios";
import { message } from "antd";

const StudentUpload = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [excelData, setExcelData] = useState(null);

  const [invalidData, setInvalidData] = useState([]);
  const fileInputRef = useRef(null);
  const [fileInputDisabled, setFileInputDisabled] = useState(false);

  useEffect(() => {
    if (excelFile !== null) {
      handleFileSubmit();
    }
  }, [excelFile]);

  const handleFile = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        setFileInputDisabled(true);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
        };
      } else {
        setTypeError("Please select only excel file types");
        setExcelFile(null);
        setFileInputDisabled(false);
      }
    } else {
      console.log("Please select your file");
    }
  };

  // submit event
  const handleFileSubmit = (e) => {
    let header = [
      "First Name",
      "Last Name",
      "Ident",
      "Gender",
      "Class",
      "Year",
      "Email",
    ];
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      let merged = [];

      merged = mergeArraysOfObjects(header, data);

      let checkMerged = [];
      checkMerged = merged;
      setExcelData(merged);

      validateAndStoreInvalidData(checkMerged);
    }
  };

  const validateAndStoreInvalidData = (mergedData) => {
    const invalidItems = mergedData.map((item) => {
      const newItem = { ...item };
      let hasError = false;

      for (const key in newItem) {
        if (
          newItem[key] === null ||
          (typeof newItem[key] === "string" && newItem[key].trim() === "")
        ) {
          newItem.Error = "Please fill the empty fields";
          hasError = true;
          break;
        }
        if (
          (key === "First Name" || key === "Last Name") &&
          /\d/.test(newItem[key])
        ) {
          newItem.Error = "First Name and Last Name cannot contain numbers";
          hasError = true;
          break;
        }

        if (key === "Gender" && !["Male", "Female"].includes(newItem[key])) {
          newItem.Error = "Gender must be 'Male' or 'Female'";
          hasError = true;
          break;
        }
        if (key === "Username" && !isValidEmail(newItem[key])) {
          newItem.Error = "Username must be a valid email address";
          hasError = true;
          break;
        }
      }

      return hasError ? newItem : null;
    });

    setInvalidData(invalidItems.filter((item) => item !== null));
  };
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function mergeArraysOfObjects(keysArray, objectsArray) {
    const mergedArray = [];

    for (let i = 2; i < objectsArray.length; i++) {
      const obj = objectsArray[i];
      const mergedObject = {};

      keysArray.forEach((key, j) => {
        if (obj.hasOwnProperty(`__EMPTY_${j + 1}`)) {
          mergedObject[key] = obj[`__EMPTY_${j + 1}`];
        } else {
          mergedObject[key] = null;
        }
      });

      mergedArray.push(mergedObject);
    }

    return mergedArray;
  }

  const handleStudentUpload = async (e) => {
    e.preventDefault();

    try {
      const transformedDataArray = [];

      Object.keys(excelData).forEach((key) => {
        const transformedData = {};
        Object.keys(excelData[key]).forEach((innerKey) => {
          const newKey = innerKey.replace(/\s+/g, "");
          transformedData[newKey.charAt(0).toLowerCase() + newKey.slice(1)] =
            excelData[key][innerKey];
        });
        transformedDataArray.push(transformedData);
      });

      const existingClassesResponse = await axios.get(
        "http://localhost:3000/classes"
      );

      const existingClasses = existingClassesResponse.data;

      const uniqueClasses = new Set();

      for (const transformedData of transformedDataArray) {
        const className = transformedData.class;
        const classYear = transformedData.year;
        const classKey = `${className}-${classYear}`;

        if (!uniqueClasses.has(classKey)) {
          uniqueClasses.add(classKey);

          const existingClass = existingClasses.find(
            (classObj) =>
              classObj.name === className && classObj.year === classYear
          );

          if (!existingClass) {
            const classObject = {
              name: className,
              year: classYear,
            };

            await axios.post(
              "http://localhost:3000/classes",
              classObject
            );
          }
        }
      }

      for (const transformedData of transformedDataArray) {
        const response = await axios.post(
          "http://localhost:3000/students",
          transformedData
        );
        message.success("Students imported successfully");
        console.log("Data uploaded successfully:", response.data);
      }

      setExcelData(null);
      setInvalidData([]);
    } catch (error) {
      console.error("Error uploading data:", error);
      message.error("Student import failed", error);
    }
  };

  const handleReset = () => {
    setExcelFile(null);
    setExcelData(null);
    setInvalidData([]);

    setFileInputDisabled(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="wrapper">
      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        {excelData && (
          <div style={{ display: "block" }}>
            <button className="btn" onClick={handleStudentUpload}>
              Save the students
            </button>
            <button className="btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        )}
        <input
          type="file"
          className="form-control"
          required
          onChange={handleFile}
          ref={fileInputRef}
          disabled={fileInputDisabled}
        />
        {typeError && (
          <div className="alert alert-danger" role="alert">
            {typeError}
          </div>
        )}
      </form>

      <div className="viewer">
        {excelData ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key) => (
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No File is uploaded yet!</div>
        )}
      </div>
      <div className="viewer" style={{ display: "block" }}>
        {invalidData.length > 0 && (
          <h4>Please correct the following errors:</h4>
        )}
        {invalidData.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(invalidData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invalidData.map((item, index) => (
                  <tr key={index}>
                    {Object.keys(item).map(
                      (key) => key !== "error" && <td key={key}>{item[key]}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default StudentUpload;
