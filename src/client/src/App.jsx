import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Button, Icon } from "@blueprintjs/core";

import FileExplorer from './components/FileExplorer';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StorageAnalyzer from './components/StorageAnalyzer';
import credentials, { refreshToken, setTokenRefreshTimeout } from './services/auth';
import { getAbout, getQuotaDetails } from './services/userInfo';
import './App.css';

const UserManager = ({ children }) => {
  const [about, setAbout] = useState({});

  useEffect(setTokenRefreshTimeout, []);

  useEffect(() => {
    let fetchedAbout = {};

    getAbout(['user'])
      .then((userInfo) => {fetchedAbout = {...fetchedAbout, ...userInfo}; setAbout(fetchedAbout)});
    
    getQuotaDetails()
      .then((quota) => {fetchedAbout = {...fetchedAbout, quota}; setAbout(fetchedAbout)});
  
  }, []);

  // if refresh token missing
  if (!credentials.refresh_token) {
    window.location.replace('/');
    return <>Redirecting to login page...</>;
  }

  if (about.user && about.quota) console.log(about);

  // if access token is expired
  if (credentials.expiry_date <= new Date()) {
    refreshToken()
      .then(() => window.location.reload(false))
      .catch(() => {
        window.location.replace('/');
      });
    return <>Connecting to Google Drive...</>;
  }

  return (
    <>
      <div style={{margin: "0 1rem", position: "absolute", "top": "3px", "right": "3px"}}>
        <img
          src={about.user && about.user.photoLink}
          alt="user image"
          referrerPolicy="no-referrer"
          style={{borderRadius: '50%', width: '32px', height: '32px'}}
        />
      </div>
      { children }
    </>
  );
}

const TabsBar = () => {
  return (
    <div className="TabsBar">
      <span className="Tab">
        <span>College</span><Icon icon='cross' size={13} style={{color: '#777'}}/>
      </span>
      <Button minimal style={{marginLeft: "2px", alignSelf: "center", borderRadius: '50%'}}><Icon icon='plus' color="#777"/></Button>
    </div>
  );
}

const App = () => {
  return (
    <div className="App">
      <UserManager>
        <div className="MainContent">
          <Sidebar/>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh'
          }}>
            <TabsBar/>
            <Routes>
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="/storage-analyzer" element={<StorageAnalyzer/>}/>
              <Route path="/:fileId" element={<FileExplorer/>}/>
              <Route path="*" element={<Navigate to="/root" />} />
            </Routes>
          </div>
        </div>
      </UserManager>
    </div>
  );
}

export default App;
