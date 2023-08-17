import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Tabs, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { SearchOutlined } from "@ant-design/icons";
import axios from "../api/axios";
import TeacherUpload from "./TeacherUpload";

const TEACHERS_URL = "/teachers";

const TeachersTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [activeTab, setActiveTab] = useState("1");

  const [form] = useForm();

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.firstName.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleModalOpen = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    axios
      .get(TEACHERS_URL)
      .then((response) => {
        setTeachers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (selectedTeacher) {
          axios
            .put(`http://localhost:3000/teachers/${selectedTeacher.id}`, values)
            .then(() => {
              message.success("Teacher edited successfully");

              fetchTeachers();

              form.resetFields();
              setIsModalVisible(false);
              setSelectedTeacher(null);
            })
            .catch((error) => {
              console.error("Error updating Teacher:", error);
            });
        } else {
          // add ako se ne menja
          axios
            .post("http://localhost:3000/teachers", values)
            .then((response) => {
              message.success("Teacher added successfully ");

              fetchTeachers();

              form.resetFields();
              setIsModalVisible(false);
            })
            .catch((error) => {
              console.error("Error adding teacher:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Form validation error:", error);
      });
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    form.setFieldsValue(teacher);
    setIsModalVisible(true);
  };
  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3000/teachers/${id}`)
      .then(() => {
        message.success("Teacher deleted successfully");
        fetchTeachers();
      })
      .catch((error) => {
        message.warning("Error deleting teacher", error);
      });
  };

  const columns = [
    {
      title: "First name",
      dataIndex: "firstName",
      key: "firstName",
      width: "10%",
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
      title: "ID(or other unique identifier)",
      dataIndex: "ident",
      key: "ident",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title:
        "Authority(which class(es) or year(s) they should see in Upstrive)",
      dataIndex: "authority",
      key: "authority",
    },
    {
      title:
        "Username (we suggest school email address or any other username they are familiar with)",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Sos button",
      dataIndex: "sosButton",
      key: "sosButton",
    },
    {
      title: "Couselor button",
      dataIndex: "counselorButton",
      key: "counselorButton",
    },
    {
      title: "Actions",
      dataIndex: "id",
      width: "15%",
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
      label: "Add teacher",
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
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
              style={{ fontSize: "14px", height: "30px", width: "300px" }}
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
            label="ID (or other unique identifier)"
            name="ident"
            rules={[{ required: true, message: "Please enter the ID" }]}
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please select the title" },
              {
                type: "enum",
                enum: ["Mr.", "Mrs."],
                message: "Title must be Mr. or Mrs.",
              },
            ]}
          >
            <Select
              style={{ width: "300px" }}
              options={[
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
              ]}
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
            label="	Authority(which class(es) or year(s) they should see in Upstrive)"
            name="authority"
          >
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item
            label="	Username (we suggest school email address or any other username they are familiar with)"
            name="username"
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
          <Form.Item label="Sos button" name="sosButton">
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
          <Form.Item label="Couselor button" name="counselorButton">
            <Input
              style={{ height: "30px", width: "300px", fontSize: "14px" }}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "Import teacher",
      children: (
        <div>
          <TeacherUpload />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ margin: "5px" }}>
        <h1>Teachers</h1>
      </div>
      <div>
        <Button style={{ margin: "5px" }} onClick={handleModalOpen}>
          Add Teacher
        </Button>
        <Table
          scroll={{ x: "60%" }}
          dataSource={filteredTeachers}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
        <Modal
          title={selectedTeacher ? "Edit teacher" : "Add teacher"}
          open={isModalVisible}
          width={900}
          onCancel={() => {
            form.resetFields();
            setIsModalVisible(false);
            setSelectedTeacher(null);
          }}
          onOk={handleModalOk}
          footer={
            <div>
              {activeTab === "1" && (
                <>
                  <Button
                    onClick={() => {
                      form.resetFields();
                      setIsModalVisible(false);
                      setSelectedTeacher(null);
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

export default TeachersTable;
