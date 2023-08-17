import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import "../styles/StudentUpload.css";
import axios from "../api/axios";
import { message } from "antd";

const TeacherUpload = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

  const [excelData, setExcelData] = useState(null);
  const [authorityOptions, setAuthorityOptions] = useState([]);

  const [invalidData, setInvalidData] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (excelFile !== null) {
      handleFileSubmit();
    }
  }, [excelFile]);

  useEffect(() => {
    async function fetchAuthorityOptions() {
      try {
        const response = await axios.get("http://localhost:3000/classes");
        setAuthorityOptions(response.data);
      } catch (error) {
        console.error("Error fetching authority options:", error);
      }
    }

    fetchAuthorityOptions();
  }, []);

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
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
        };
      } else {
        setTypeError("Please select only excel file types");
        setExcelFile(null);
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
      "ID",
      "Title",
      "Gender",
      "Authority",
      "Email",
      "Sos Button",
      "Counselor Button",
    ];
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[1];
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
        if (key === "Authority" && !validateAuthority(newItem[key])) {
          newItem.Error = "Invalid Authority";
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

  const validateAuthority = (authority) => {
    const lowerCaseAuthority = authority.toLowerCase();

    if (lowerCaseAuthority === "all") {
      return true;
    }
    
    const authorityArray = authority.split(",").map((part) => part.trim());

    const checkArray = [];

    authorityArray.forEach((value) => {
      const isValid = authorityOptions.some(
        (option) => value === option.name || Number(value) === option.year
      );
      checkArray.push(isValid);
    });

    if (checkArray.every((value) => value)) {
      return true;
    }

    const regexPattern = /^Head of year (.+)$/i;

    const match = authority.match(regexPattern);

    if (match && match[1]) {
      const authoritySubstring = match[1];

      const lowerCaseAuthority = authoritySubstring.toLowerCase();
      for (const option of authorityOptions) {
        const lowerCaseName = option.name.toLowerCase();
        const lowerCaseYear = option.year.toString();

        if (
          lowerCaseAuthority === lowerCaseName ||
          lowerCaseAuthority === lowerCaseYear
        ) {
          return true;
        }
      }
    } else {
      for (const option of authorityOptions) {
        const lowerCaseName = option.name.toLowerCase();
        const lowerCaseYear = option.year.toString();

        if (
          lowerCaseAuthority === lowerCaseName ||
          lowerCaseAuthority === lowerCaseYear
        ) {
          return true;
        }
      }
      return false;
    }

    return false;
  };

  function mergeArraysOfObjects(keysArray, objectsArray) {
    const mergedArray = [];

    for (let i = 3; i < objectsArray.length; i++) {
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

  const handleTeacherUpload = async (e) => {
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

      for (const transformedData of transformedDataArray) {
        const response = await axios.post(
          "http://localhost:3000/teachers",
          transformedData
        );
        message.success("Teachers imported successfully");
      }

      setExcelData(null);
      setInvalidData([]);
    } catch (error) {
      console.error("Error uploading data:", error);
      message.error("Teachers import failed");
    }
  };

  const handleReset = () => {
    setExcelFile(null);
    setExcelData(null);
    setInvalidData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="wrapper">
      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        {excelData && (
          <div style={{ display: "block" }}>
            <button className="btn" onClick={handleTeacherUpload} disabled={invalidData}>
              Save the Teachers
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

export default TeacherUpload;
