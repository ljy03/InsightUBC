import Navbar from './Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Section from './Section';
import Room from './Room';
import ShowSections from './ShowSections';
import ShowRooms from './ShowRooms';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="body">
          <Routes>
          <Route exact path="/Section" element={<Section/>}/>
          <Route exact path="/Room" element={<Room/>}/>
          <Route exact path ='/ShowSections' element={<ShowSections />} />
          <Route exact path ='/ShowRooms' element={<ShowRooms />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
