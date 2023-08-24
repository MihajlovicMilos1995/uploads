import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import "../styles/StudentUpload.css";
import axios from "../api/axios";
import { message } from "antd";
import AuthorityDropdown from "./AuthorityDropdown";

const TeacherUpload = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);

  const [excelData, setExcelData] = useState(null);
  const [editedExcelData, setEditedExcelData] = useState(null);
  const [authorityOptions, setAuthorityOptions] = useState([]);
  const [roles, setRoles] = useState([]);

  const [invalidData, setInvalidData] = useState([]);
  const fileInputRef = useRef(null);
  const updatedExcelData = excelData;

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

    async function fetchRoles() {
      try {
        const response = await axios.get("http://localhost:3000/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }

    fetchAuthorityOptions();
    fetchRoles();
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

    const authorityParts = lowerCaseAuthority.split(" ");
    const authorityName = authorityParts[0];

    const matchingRole = roles.find((role) => {
      const prefixes = role.prefix
        .toLowerCase()
        .split(",")
        .map((prefix) => prefix.trim());
      return prefixes.includes(authorityName);
    });

    if (
      matchingRole &&
      matchingRole.right_text.toLowerCase() === "all rights"
    ) {
      return true;
    }

    const splitAuthorities = authority.split(",");
    const checkedAuthorities = [];

    splitAuthorities.forEach((value) => {
      const trimmedValue = value.trim().toLowerCase();

      const isValidNumber = !isNaN(trimmedValue);
      const isValidName = authorityOptions.some(
        (option) =>
          trimmedValue === option.name.toLowerCase() ||
          (isValidNumber && Number(trimmedValue) === option.year)
      );

      checkedAuthorities.push(isValidName);
    });

    if (checkedAuthorities.every((value) => value)) {
      return true;
    }

    let dynamicMatched = false;

    roles.forEach((role) => {
      const prefixes = role.prefix
        .toLowerCase()
        .split(",")
        .map((prefix) => prefix.trim());

      prefixes.forEach((prefix) => {
        const regexPattern = `^${prefix} (.+)`;
        const regex = new RegExp(regexPattern, "i");

        const match = lowerCaseAuthority.match(regex);

        if (match && match[1]) {
          const authoritySubstring = match[1];
          const authSubstingArray = authoritySubstring.split(",");
          const substringCheck = [];

          authSubstingArray.forEach((value) => {
            const trimmedValue = value.trim().toLowerCase();
            const isValidNumber = !isNaN(trimmedValue);
            const isValidName = authorityOptions.some(
              (option) =>
                trimmedValue === option.name.toLowerCase() ||
                (isValidNumber && Number(trimmedValue) === option.year)
            );
            substringCheck.push(isValidName);
          });

          if (substringCheck.every((value) => value)) {
            dynamicMatched = true;
            return;
          }
        }
      });
    });

    if (dynamicMatched) {
      return true;
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

  const handleUpdateAuthority = (index, updatedAuthority) => {
    const updatedInvalidData = [...invalidData];
    updatedInvalidData[index].Authority = updatedAuthority.join(", ");

    const matchingIndex = excelData.findIndex(
      (item) =>
        item["First Name"] === updatedInvalidData[index]["First Name"] &&
        item["Last Name"] === updatedInvalidData[index]["Last Name"]
    );

    if (matchingIndex !== -1) {
      const updatedExcel = [...editedExcelData];
      updatedExcel[matchingIndex] = updatedInvalidData[index];
      setEditedExcelData(updatedExcel); 
    }
  };

  const handleAddToExcel = (e) => {
    e.preventDefault();

    const filteredExcelData = editedExcelData.map((item) => {
      const { Error, ...rest } = item;
      return rest;
    });

    setExcelData(filteredExcelData);
    setInvalidData([]);
  };

  return (
    <div className="wrapper">
      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        {excelData && (
          <div style={{ display: "block" }}>
            {invalidData.length !== 0 ? (
              <button className="btn" onClick={handleAddToExcel}>
                Validate data
              </button>
            ) : (
              <button className="btn" onClick={handleTeacherUpload}>
                Save the Teachers
              </button>
            )}
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
                    {Object.keys(item).map((key) => (
                      <td key={key}>
                        {key === "Authority" ? (
                          <AuthorityDropdown
                            roles={roles}
                            selectedAuthority={item[key]}
                            onUpdate={(updatedAuthority) =>
                              handleUpdateAuthority(index, updatedAuthority)
                            }
                          />
                        ) : (
                          item[key]
                        )}
                      </td>
                    ))}
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
