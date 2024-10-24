import { 
  BrowserRouter as Router, 
  Route, 
  Routes 
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/About" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

