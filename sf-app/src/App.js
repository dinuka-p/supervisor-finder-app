
import { BrowserRouter, Routes, Route, NavLink} from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Page2 from './components/Page2';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <div>
            <NavLink className="App-link" to="/">Home</NavLink> | <NavLink className="App-link" to="/page2">Page 2</NavLink>
          </div>
          <Routes>
              <Route exact path="/" element={<Dashboard/>}/>
              <Route path="/page2" element={<Page2/>}/>
          </Routes>
        </BrowserRouter>
        
      </header>
    </div>
  );
}

export default App;
