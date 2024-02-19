import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MD5List from './components/MD5List';
import AddMD5 from './components/AddMD5';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Header/>
        <div className='p-5'>
          <Routes>
            <Route path="/" element={<MD5List />} />
            <Route path="/add" element={<AddMD5 />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;