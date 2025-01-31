// Dashboard.jsx
import React, { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import logoDark from '../../../resources/logoDarkmode.png';
import logo from '../../../resources/logo.png';

const Dashboard = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');

  return (
    <div className='dashboardContainer'>
      <div className='topleftContainer'>
        <div className='sideMenu'>
          <div className='logo'>
            <img src={logo} alt="logo" />
            <h1>Electristock</h1>
          </div>
          <Link to="dashboard" onClick={() => setSelectedMenu('Dashboard')}><h3>Dashboard</h3></Link>
          <Link to="productos" onClick={() => setSelectedMenu('Productos')}><h3>Productos</h3></Link>
          <Link to="categorias" onClick={() => setSelectedMenu('Categorias')}><h3>Categorias</h3></Link>
          <Link to="proveedores" onClick={() => setSelectedMenu('Proveedores')}><h3>Proveedores</h3></Link>
          <Link to="contratos" onClick={() => setSelectedMenu('Contratos')}><h3>Contratos</h3></Link>
          <Link to="inventario" onClick={() => setSelectedMenu('Inventario')}><h3>Inventario</h3></Link>
          <Link to="movimientos" onClick={() => setSelectedMenu('Movimientos de Stock')}><h3>Movimientos de Stock</h3></Link>
        </div>
        
        <div className='topBar'>
          <h1>{selectedMenu}</h1>
        </div>
      </div>

      <div className='content'>
        <Routes>
          <Route path="dashboard" element={<div>Contenido del Dashboard</div>} />
          <Route path="productos" element={<div>Contenido de Productos</div>} />
          <Route path="categorias" element={<div>Contenido de Categorias</div>} />
          <Route path="proveedores" element={<div>Contenido de Proveedores</div>} />
          <Route path="contratos" element={<div>Contenido de Contratos</div>} />
          <Route path="inventario" element={<div>Contenido de Inventario</div>} />
          <Route path="movimientos" element={<div>Contenido de Movimientos de Stock</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;