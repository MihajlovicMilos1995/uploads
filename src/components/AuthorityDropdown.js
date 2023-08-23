import React, { useState, useEffect } from "react";
import { Select } from "antd";
import axios from "../api/axios";

const { Option } = Select;

const AuthorityDropdown = ({ selectedAuthority, onUpdate, roles }) => {
  const [authorityOptions, setAuthorityOptions] = useState([]);
  let matchingRole;
  let matchedRole;
  let auth;

  useEffect(() => {
    auth = selectedAuthority;
  }, []);
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
    let newAuthorityWithPrefix = newAuthority;
    if (matchingRole) {
      const prefix = auth.match(/^[^\d]+/)[0].trim();
      console.log("prefix", prefix);
      newAuthorityWithPrefix = newAuthority.map(
        (authority) => `${prefix} ${authority}`
      );
    }
    onUpdate(newAuthorityWithPrefix);
  };

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
            <Option key={authority.year} value={authority.year}>
              {authority.year}
            </Option>
          )}
          {(!matchedRole || matchedRole.right !== "year") && (
            <Option key={authority.name} value={authority.name}>
              {authority.name}
            </Option>
          )}
        </>
      ))}
    </Select>
  );
};

export default AuthorityDropdown;
