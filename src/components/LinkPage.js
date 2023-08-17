import { Link } from "react-router-dom";

const LinkPage = () => {
  return (
    <section>
      <h1>Links</h1>
      <br />
      <Link to="/login">Login</Link>
      <br />
      <Link to="/students">Students</Link>
      <Link to="/teachers">Teachers</Link>
      <Link to="/classes">Classes</Link>
      <br />
      <Link to="/register">Create user</Link>
    </section>
  );
};

export default LinkPage;
