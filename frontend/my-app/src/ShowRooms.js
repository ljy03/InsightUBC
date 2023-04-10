const ShowRooms = (props) => {
	const cols = props.cols? props.cols: [];
	const showRes = props.show? true: false;
	const res = props.respond? props.respond: [[]];
	const reference = props.reference? props.reference: [];

	const rowSelect = (e, index) => {
		if (reference[index] !== "") {
			window.location.href = reference[index];
		}
	}

  return (
  <table className="result" id = "clickable" style={{ visibility: showRes ? "visible" : "hidden" }}>
  	<thead>
  	  <tr>
  	  	{cols.map(heading => {
  	  		let elems = heading.split("_");
  	  		if (elems[1] !== "href") {
  	  		  return <th key={elems[1]}>{elems[1]}</th>
  	  		}
  	  	})}
  	  </tr>
  	 </thead>
  	 <tbody>
  	 	{res.map((row, index) => {
  	 		return <tr className = "clickable" key={index} onClick={(e) => rowSelect(e, index)}>
  	 				{row.map(data => {
						return <td>{data}</td>
  	 				})}
  	 			</tr>
  	 	})}
  	 </tbody>
  </table>
  );
}

export default ShowRooms;
