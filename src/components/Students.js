import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Select, Tabs } from "antd";
import { useForm } from "antd/es/form/Form";
import { SearchOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import StudentUpload from "./StudentUpload";

const STUDENTS_URL = "/students";

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("1");

  const [form] = useForm();

  const filteredStudents = students.filter((student) =>
    student.firstName?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    axios
      .get(STUDENTS_URL)
      .then((response) => {
        setStudents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (selectedStudent) {
          axios
            .put(`http://localhost:3000/students/${selectedStudent.id}`, values)
            .then(() => {
              message.success("Student edited successfully");

              fetchStudents();

              form.resetFields();
              setIsModalVisible(false);
              setSelectedStudent(null);
            })
            .catch((error) => {
              console.error("Error updating student:", error);
            });
        } else {
          // add ako se ne menja
          axios
            .post("http://localhost:3000/students", values)
            .then((response) => {
              message.success("Student added successfully ");

              fetchStudents();

              form.resetFields();
              setIsModalVisible(false);
            })
            .catch((error) => {
              console.error("Error adding student:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Form validation error:", error);
      });
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    form.setFieldsValue(student);
    setIsModalVisible(true);
  };
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3000/students/${id}`)
      .then(() => {
        message.success("Student deleted successfully");
        fetchStudents();
      })
      .catch((error) => {
        message.warning("Error deleting student", error);
      });
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      width: "14%",
      filterDropdown: () => (
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder="Search"
        />
      ),
    },
    {
      title: "Last name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "ID",
      dataIndex: "ident",
      key: "ident",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Actions",
      dataIndex: "id",
      width: "20%",
      render: (id, record) => {
        return (
          <span>
            <Button type="link" onClick={() => handleEdit(record)}>
              Edit
            </Button>
            <Button type="link" onClick={() => handleDelete(id)}>
              Delete
            </Button>
          </span>
        );
      },
    },
  ];

  const items = [
    {
      key: "1",
      label: "Add student",
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Form.Item
            label="First name"
            name="firstName"
            rules={[
              { required: true, message: "Please enter the first name" },
              {
                pattern: /^[a-zA-Z]+$/,
                message: "First name cannot contain numbers",
              },
            ]}
          >
            <Input
              style={{
                height: "30px",
                width: "300px",
                fontSize: "14px",
              }}
            />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, message: "Please enter the last name" },
              {
                pattern: /^[a-zA-Z]+$/,
                message: "Last name cannot contain numbers",
              },
            ]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="ID"
            name="ident"
            rules={[{ required: true, message: "Please enter the ID" }]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="Username"
            name="email"
            rules={[
              { required: true, message: "Please enter the username" },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[
              { required: true, message: "Please select the gender" },
              {
                type: "enum",
                enum: ["Male", "Female"],
                message: "Gender must be Male or Female",
              },
            ]}
          >
            <Select
              style={{ width: "300px" }}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Year"
            name="year"
            rules={[{ required: true, message: "Please enter the year" }]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Please enter the class" }]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="Teacher"
            name="teacher"
            rules={[{ required: true, message: "Please enter the teacher" }]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item label="Counselor" name="counselor">
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item label="Head of year" name="headOfYear">
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "Import students",
      children: (
        <div>
          <StudentUpload />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ margin: "5px" }}>
        <h1>Students</h1>
      </div>
      <div>
        <Button style={{ margin: "5px" }} onClick={handleModalOpen}>
          AddStudent
        </Button>
        <Table
          scroll={{ x: "60%" }}
          dataSource={filteredStudents}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
        <Modal
          title={selectedStudent ? "Edit student" : "Add student"}
          open={isModalVisible}
          width={800}
          onCancel={() => {
            form.resetFields();
            setIsModalVisible(false);
            setSelectedStudent(null);
            fetchStudents();
          }}
          footer={
            <div>
              {activeTab === "1" && (
                <>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setIsModalVisible(false);
                      setSelectedStudent(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleModalOk} type="primary">
                    OK
                  </Button>
                </>
              )}
            </div>
          }
        >
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={(activeKey) => setActiveTab(activeKey)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default StudentTable;
