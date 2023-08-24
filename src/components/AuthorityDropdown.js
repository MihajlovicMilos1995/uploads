import React, { useState, useEffect } from "react";
import { Select } from "antd";
import axios from "../api/axios";

const { Option } = Select;

const AuthorityDropdown = ({ selectedAuthority, onUpdate, roles }) => {
  const [authorityOptions, setAuthorityOptions] = useState([]);
  const [matchedRole, setMatchedRole] = useState(null);
  let matchingRole;

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

  const handleAuthorityChange = (newAuthority) => {
    let newAuthorityWithPrefix = [];
    let prefix = selectedAuthority.replace(/[\d,]+/g, "").trim();

    if (matchedRole) {
      newAuthorityWithPrefix.push(`${prefix} ${newAuthority.join(", ")}`);
    } else {
      newAuthorityWithPrefix.push(`${prefix} ${newAuthority}`);
    }

    onUpdate(newAuthorityWithPrefix);
  };

  useEffect(() => {
    const calculateMatchedRole = () => {
      let matchedRole = null;
      roles.forEach((role) => {
        const prefixes = role.prefix
          .toLowerCase()
          .split(",")
          .map((prefix) => prefix.trim());

        prefixes.forEach((prefix) => {
          const regexPattern = `^${prefix} (.+)`;
          const regex = new RegExp(regexPattern, "i");

          matchingRole = selectedAuthority.toLowerCase().match(regex);

          if (matchingRole) {
            matchedRole = role;
          }
        });
      });
      return matchedRole;
    };

    setMatchedRole(calculateMatchedRole());
  }, []);

  return (
    <Select
      mode="multiple"
      style={{ width: "130px" }}
      placeholder="Select authority"
      //value={selectedAuthority ? selectedAuthority.split(",") : []}
      onChange={handleAuthorityChange}
    >
      {authorityOptions.map((authority) => (
        <>
          {matchedRole && matchedRole.right === "year" && (
            <Option key={authority.id} value={authority.year}>
              {authority.year}
            </Option>
          )}
          {(!matchedRole || matchedRole.right !== "year") && (
            <Option key={authority.id} value={authority.name}>
              {authority.name}
            </Option>
          )}
        </>
      ))}
    </Select>
  );
};

export default AuthorityDropdown;
