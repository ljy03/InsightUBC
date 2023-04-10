import { useState } from "react";
import ShowSections from './ShowSections';

const Section = () => {
  const [clicked, changeVisibility] = useState(true)
  const [showRes, showVisibility] = useState(false)
  const [dept, setDept] = useState('');
  const [id, setId] = useState('');
  const [gt, setGT] = useState(0);
  const [ld, setLD] = useState(0);
  const [title, setTitle] = useState(false)
  const [audit, setAudit] = useState(false)
  const [fail, setFail] = useState(false)
  const [pass, setPass] = useState(false)
  const [avg, setAvg] = useState(false)
  const [uuid, setUuid] = useState(false)
  const [instructor, setInstructor] = useState(false)
  const [cols, setCols] = useState(["sections_dept", "sections_id", "sections_year"]);
  const [res, setRes] = useState([]);
  const [alert, setAlert] = useState(false);
  const [errMessage, setMessage] = useState("undefined error");

  const handleSubmit = (e) => {
    e.preventDefault();
    let query = {};
    let deptElem = { "sections_dept": dept };
    let idElem = { "sections_id": id };
    let ldYear = { "sections_year": Number(ld) };
    let gtYear = { "sections_year": Number(gt) };
    let filter = [{ "IS": deptElem }, { "IS": idElem }, { "GT": gtYear }, { "LT": ldYear }];
    query["WHERE"] = { "AND": filter }
    let temp = cols;
    if (title) {
      temp.push("sections_title");
    }
    if (audit) {
      temp.push("sections_audit");
    }
    if (fail) {
      temp.push("sections_fail");
    }
    if (pass) {
      temp.push("sections_pass");
    }
    if (avg) {
      temp.push("sections_avg");
    }
    if (uuid) {
      temp.push("sections_uuid");
    }
    if (instructor) {
      temp.push("sections_instructor");
    }
    setCols(temp);
    query["OPTIONS"] = { "COLUMNS": cols };
    if (cols.length === 3) {
      setMessage("Please select at least one checkbox");
      setAlert(!alert);
    }
    if (cols.length > 3) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", 'http://localhost:4321/query', true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          let result = JSON.parse(xhr.response)["result"];
          if (result.length !== 0) {
            let intermediate = [];
            result.forEach((elem) => {
              let keys = Object.keys(elem);
              let temp = [];
              keys.forEach((key) => {
                temp.push(elem[key]);
              });
              intermediate.push(temp);
            });
            setRes(intermediate);
            changeVisibility(false);
            showVisibility(true);
          } else {
            setMessage("No course found");
            setAlert(!alert);
            setCols(["sections_dept", "sections_id", "sections_year"]);
          }

        } else if (xhr.readyState === 4 && xhr.status === 400) {
          let error = JSON.parse(xhr.response)["error"];
          if (error === "result too large") {
            setMessage("result too large (more than 5000 courses found)");
          } else {
            setMessage("error querying result");
          }
          setAlert(!alert);
          setCols(["sections_dept", "sections_id", "sections_year"]);
        }
      }
      xhr.send(JSON.stringify(query));
    }

  }

  return (
    <div>
      <div className="data" style={{ display: clicked ? "block" : "none" }}>
        <h2>Find a Course</h2>
        <form onSubmit={handleSubmit}>
          <label>Course Subject:</label>
          <input
            type="text"
            required
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />
          <label>Course Number:</label>
          <input
            type="text"
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <label>Year Since:</label>
          <input
            type="number"
            required
            value={gt}
            onChange={(e) => setGT(e.target.value)}
          />
          <label>Year To:</label>
          <input
            type="number"
            required
            value={ld}
            onChange={(e) => setLD(e.target.value)}
          />
          <div className="checkboxes">
            <label>Select to Display:</label>
            <input type="checkbox" id="title" checked={title}
              onChange={() => setTitle(!title)} />
            <label htmlFor="title">Course Title</label>
            <input type="checkbox" id="audit" checked={audit}
              onChange={() => setAudit(!audit)} />
            <label htmlFor="audit">Number of Audit</label>
            <input type="checkbox" id="fail" checked={fail}
              onChange={() => setFail(!fail)} />
            <label htmlFor="fail">Number of Fail</label>
            <input type="checkbox" id="pass" checked={pass}
              onChange={() => setPass(!pass)} />
            <label htmlFor="pass">Number of Pass</label>
            <input type="checkbox" id="avg" checked={avg}
              onChange={() => setAvg(!avg)} />
            <label htmlFor="avg">Class Average</label>
            <input type="checkbox" id="instructor" checked={instructor}
              onChange={() => setInstructor(!instructor)} />
            <label htmlFor="instructor">Professor</label>
            <input type="checkbox" id="uuid" checked={uuid}
              onChange={() => setUuid(!uuid)} />
            <label htmlFor="uuid">Section Identifier</label>
          </div>
          <button style={{ padding: "10px" }}>Find Courses</button>
        </form>
      </div>

      <ShowSections cols={cols} respond={res} show={showRes} />

      <div className="alert" style={{ display: alert ? "block" : "none" }}>
        <span className="closebtn" onClick={(e) => setAlert(!alert)}>&times;</span>
        {errMessage}
      </div>
    </div>

  );
}

export default Section;
