const ShowSections = (props) => {
	const cols = props.cols ? props.cols : [];
	const showRes = props.show ? true : false;
	const res = props.respond ? props.respond : [[]];
	return (
		<table className="result" style={{ visibility: showRes ? "visible" : "hidden" }}>
			<thead>
				<tr>
					{cols.map(heading => {
						let elems = heading.split("_");
						return <th key={elems[1]}>{elems[1]}</th>
					})}
				</tr>
			</thead>
			<tbody>
				{res.map((row, index) => {
					return <tr key={index}>
						{row.map(data => {
							return <td>{data}</td>
						})}
					</tr>
				})}
			</tbody>
		</table>
	);
}

export default ShowSections;
