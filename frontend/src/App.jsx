import { 
  BrowserRouter as Router, 
  Route, 
  Routes 
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Create from "./pages/Create";
// import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PublicProfile from "./pages/PublicProfile";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-indigo-950">
        <Header />

        <main className="flex-grow p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            {/* <Route path="/discover" element={<Discover />} /> */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:username" element={<PublicProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

