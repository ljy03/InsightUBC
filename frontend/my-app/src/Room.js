import { useState } from "react";
import ShowRooms from './ShowRooms';
const Room = () => {
  const [clicked, changeVisibility] = useState(true)
  const [showRes, showVisibility] = useState(false)
  const [shortname, setBuilding] = useState('');
  const [furniture, setFurniture] = useState('*Tables*');
  const [gt, setGT] = useState(0);
  const [ld, setLD] = useState(0);
  const [cols, setCols] = useState(["rooms_name", "rooms_furniture", "rooms_seats", "rooms_address", "rooms_href"]);
  const [res, setRes] = useState([]);
  const [ref, setRef] = useState([]);
  const [alert, setAlert] = useState(false);
  const [errMessage, setMessage] = useState("No result found, try another building");

  const handleSubmit = (e) => {
    e.preventDefault();
    let query = {};
    let buildingElem = { "rooms_shortname": shortname };
    let furnitureElem = { "rooms_furniture": furniture };
    let ldSeat = { "rooms_seats": Number(ld) };
    let gtSeat = { "rooms_seats": Number(gt) };
    let filter = [{ "IS": buildingElem }, { "IS": furnitureElem }, { "GT": gtSeat }, { "LT": ldSeat }];
    query["WHERE"] = { "AND": filter }
    query["OPTIONS"] = { "COLUMNS": cols, "ORDER": "rooms_seats" };

    let xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:4321/query', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        let result = JSON.parse(xhr.response)["result"];
        if (result.length !== 0) {
          let intermediate = [];
          let ref = [];
          result.forEach((elem) => {
            let keys = Object.keys(elem);
            let temp = [];
            keys.forEach((key) => {
              if (key !== "rooms_href") {
                temp.push(elem[key]);
              } else {
                ref.push(elem[key]);
              }
            });
            intermediate.push(temp);
          });
          setRes(intermediate);
          setRef(ref);
          changeVisibility(false);
          showVisibility(true);
        } else {
          setAlert(!alert);
          setCols(["rooms_name", "rooms_furniture", "rooms_seats", "rooms_address", "rooms_href"]);
        }
      } else if (xhr.readyState === 4 && xhr.status === 400) {
        setMessage("error querying room information");
        setAlert(!alert);
        setCols(["rooms_name", "rooms_furniture", "rooms_seats", "rooms_address", "rooms_href"]);
      }
    }
    xhr.send(JSON.stringify(query));

  }

  return (
    <div>
      <div className="data" style={{ display: clicked ? "block" : "none" }}>
        <h2>Find a Room</h2>
        <form onSubmit={handleSubmit}>
          <label>Building Shortname:</label>
          <input
            type="text"
            required
            value={shortname}
            onChange={(e) => setBuilding(e.target.value)}
          />
          <label>Furniture Type:</label>
          <input
            type="text"
            required
            value={furniture}
            onChange={(e) => setFurniture(e.target.value)}
          />
          <label>Min Seat Capacity:</label>
          <input
            type="number"
            required
            value={gt}
            onChange={(e) => setGT(e.target.value)}
          />
          <label>Max Seat Capacity:</label>
          <input
            type="number"
            required
            value={ld}
            onChange={(e) => setLD(e.target.value)}
          />
          <button style={{ padding: "10px" }}>Find Rooms</button>
        </form>
      </div>

      <div className="alert" style={{ display: alert ? "block" : "none" }}>
        <span className="closebtn" onClick={(e) => setAlert(!alert)}>&times;</span>
        {errMessage}
      </div>
      <ShowRooms cols={cols} respond={res} reference={ref} show={showRes} />
    </div>

  );
}

export default Room;
