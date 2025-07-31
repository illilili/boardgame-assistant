import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';


function App() {
    return (
      <Router>
        <Routes>
           <Route path="/signup" element={<SignUp/>} /> 
           <Route path="/login" element={<Login/>} /> 
        </Routes>
      </Router>
  );
}

export default App;
