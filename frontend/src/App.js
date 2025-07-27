import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageGroups from "./pages/ManageGroups";
import ManageEquipments from "./pages/ManageEquipments";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gestion/utilisateurs" element={<ManageUsers />} />
              <Route path="/gestion/groupes" element={<ManageGroups />} />
              <Route path="/gestion/equipements" element={<ManageEquipments />} />
              <Route path="/utilisateurs" element={<ManageUsers />} />
              <Route path="/groupes" element={<ManageGroups />} />
              <Route path="/equipements" element={<ManageEquipments />} />
              {/* Placeholder routes */}
              <Route path="/plannings" element={<div className="p-6"><h1 className="text-2xl font-bold">Plannings - En construction</h1></div>} />
              <Route path="/mes-amis" element={<div className="p-6"><h1 className="text-2xl font-bold">Mes amis - En construction</h1></div>} />
              <Route path="/plans/*" element={<div className="p-6"><h1 className="text-2xl font-bold">Plans - En construction</h1></div>} />
              <Route path="/statistiques" element={<div className="p-6"><h1 className="text-2xl font-bold">Statistiques - En construction</h1></div>} />
              <Route path="/flex-offices" element={<div className="p-6"><h1 className="text-2xl font-bold">Flex offices - En construction</h1></div>} />
              <Route path="/sites" element={<div className="p-6"><h1 className="text-2xl font-bold">Sites - En construction</h1></div>} />
              <Route path="/configurations-reseau" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurations réseau - En construction</h1></div>} />
              <Route path="/capteurs" element={<div className="p-6"><h1 className="text-2xl font-bold">Capteurs - En construction</h1></div>} />
              <Route path="/support" element={<div className="p-6"><h1 className="text-2xl font-bold">Support - En construction</h1></div>} />
              <Route path="/documentation" element={<div className="p-6"><h1 className="text-2xl font-bold">Documentation - En construction</h1></div>} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
