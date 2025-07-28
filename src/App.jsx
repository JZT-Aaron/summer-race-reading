import Homepage from "./pages/Homepages"
import ConfigPage from "./pages/ConfigPage"
import { BrowserRouter, Route, Routes } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/config/:slug" element={<ConfigPage />} />
      </Routes>
    </BrowserRouter>    
  )
}

export default App
