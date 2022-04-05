import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button, Icon } from "@blueprintjs/core";

import FileExplorer from './components/FileExplorer';
import SidebarPortal, { DashboardSidebar, UserSidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StorageAnalyzer from './components/StorageAnalyzer';
import credentials, { refreshToken } from './services/auth';
import { clearInvalidUsers, fetchAndAddUser, selectUsers } from './services/userSlice';
import { clearFetchStatus, fetchDirectoryStructure } from './services/directoryTreeSlice';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { createTab, selectActiveTab, selectTab, selectTabs, switchActiveTab, deleteTab, selectActivePath } from './services/tabSlice';

// const requestedFields = ["id", "name", "size", "mimeType", "fileExtension", "fullFileExtension",
// "quotaBytesUsed", "webViewLink", "webContentLink", "iconLink", "hasThumbnail", "thumbnailLink", "description",
// "contentHints", "imageMediaMetadata", "parents", "modifiedTime", "viewedByMeTime"];

const requestedFields = ["id", "name", "mimeType",
"quotaBytesUsed", "webViewLink", "webContentLink", "iconLink", "modifiedTime", "viewedByMeTime"];

// contentHints(thumbnail(mimeType))

const UserManager = () => {
  const users = useSelector(selectUsers);
  const dispatch = useDispatch();

  if (localStorage.getItem('refresh_token')) {

    dispatch(fetchAndAddUser({
      refreshToken: localStorage.getItem('refresh_token'),
      accessToken: localStorage.getItem('access_token'),
      expiryDate: localStorage.getItem('expiry_date'),
      scope: localStorage.getItem('scope')
    }));

    ['refresh_token', 'access_token', 'expiry_date', 'scope', 'token_type']
      .forEach(key =>
        localStorage.removeItem(key)
      );
  }

  const setTokenRefreshTimeout = (user, expiryDate) => {
    clearTimeout(user.refreshTimeout);

    return setTimeout(() => {
      refreshToken(user)
        .then((data) => {
          console.log("Refreshed user token");
          dispatch(fetchAndAddUser({
            refreshToken: user.refreshToken,
            accessToken: data.access_token,
            expiryDate: data.expiry_date,
            scope: data.scope,
            refreshTimeout: setTokenRefreshTimeout(user, data.expiry_date)
          }))
        })
        // .then(() => window.location.reload(false))
        .catch((error) => {
          alert(JSON.stringify(error));

          let newRefreshToken = prompt(`Enter new refresh token for ${user.emailAddress}`);
          
          if (!newRefreshToken) return;

          dispatch(fetchAndAddUser({
            minifiedID: user.minifiedID,
            refreshToken: newRefreshToken,
            permissionId: user.permissionId,
          }))
        });
    }, (expiryDate - new Date()) - 10000);
  };

  useEffect(() => {
    // dispatch(clearInvalidUsers());

    users.forEach(user => {
      console.log(user);
      dispatch(clearFetchStatus(user.minifiedID));

      dispatch(fetchAndAddUser({
        refreshToken: user.refreshToken,
        accessToken: user.accessToken,
        refreshTimeout: setTokenRefreshTimeout(user, user.expiryDate)
      }));
      dispatch(fetchDirectoryStructure(user.minifiedID));   // Remove this once directory is persisted.
    });
  }, []);

  return (
    <>
      <div style={{margin: "0 1rem", position: "absolute", "top": "3px", "right": "3px"}}>
        <img
          src={users.at(0) && users[0].photoLink}
          alt="user profile"
          referrerPolicy="no-referrer"
          style={{borderRadius: '50%', width: '32px', height: '32px'}}
        />
      </div>
    </>
  );
}

const TabsBar = () => {
  const tabs = useSelector(selectTabs);
  const activeTab = useSelector(selectActiveTab);
  const dispatch = useDispatch();

  return (
    <div className="TabsBar">
      { 
        tabs && tabs.map(tabInfo => 
          <span
            className={tabInfo.id === activeTab.id ? "ActiveTab Tab" : "Tab"}
            onClick={() => dispatch(switchActiveTab(tabInfo.id))}
            key={tabInfo.id.concat('_tab')}
          >
            <span>{ tabInfo.pathHistory.at(tabInfo.activePathIndex).name }</span>
            <Icon
              icon='cross'
              size={13}
              style={{
                color: tabs.length === 1 ? '#ddd' : '#777',
                // cursor: tabs.length === 1 ? 'not-allowed' : 'inherit',
                // visibility: tabs.length === 1 ? 'hidden' : 'inherit'
              }}
              onClick={() => dispatch(deleteTab(tabInfo.id))}
            />
          </span>
        )
      }
      <Button
        minimal
        style={{marginLeft: "2px", alignSelf: "center", borderRadius: '50%'}}
        onClick={() => {
          const newTabID = dispatch(createTab())
          dispatch(switchActiveTab(newTabID))
        }}
      >
        <Icon icon='plus' color="#777"/>
      </Button>
    </div>
  );
}

function getURLPath(pathObject) {
  if (pathObject.path === 'dashboard') return `/${pathObject.path}`;
  return `/${pathObject.userID}/${pathObject.path}`
}

const TabManager = (props) => {
  const navigate = useNavigate();

  const tabs = useSelector(selectTabs);
  const activeTab = useSelector(selectActiveTab);
  const activeTabPath = useSelector(selectActivePath(activeTab.id));

  useEffect(() => navigate(getURLPath(activeTabPath)), [activeTabPath]);

  const tabElements = tabs.map(tabInfo =>
    <Tab key={tabInfo.id} tabID={tabInfo.id}/>
  );
  const activeTabElement = tabElements.find(tab => tab.key === activeTab.id);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%'
      }}>
        <TabsBar/>
        { activeTabElement }
      </div>
    </>
  );
}

const Tab = ({tabID}) => {
  const self = useSelector(selectTab(tabID));
  const activeTabPath = useSelector(selectActivePath(tabID));

  const [fileExplorerSelectedFiles, setFileExplorerSelectedFiles] = useState([]);

  // TODO: Move SideBarPortal to storage analyzer, file explorer and dashboard itself
  return (
    <Routes>
      <Route path="/dashboard" element={
        <>
          <SidebarPortal element={ <DashboardSidebar/> } />
          <Dashboard tab={self}/>
        </>
      }/>
      <Route path="/:userID/*" element={
        <>
          <SidebarPortal element={ <UserSidebar userID={activeTabPath.userID}/> } />
          <Routes>
            <Route path="storage-analyzer" element={
              <StorageAnalyzer
                userID={activeTabPath.userID}
                selectedFiles={fileExplorerSelectedFiles}
                setSelectedFiles={setFileExplorerSelectedFiles}
                tab={self}
              />
            }/>
            <Route path=":fileID" element={
              <FileExplorer
                userID={activeTabPath.userID}
                selectedFiles={fileExplorerSelectedFiles}
                setSelectedFiles={setFileExplorerSelectedFiles}
                tab={self}
              />
            }/>
            <Route path="*" element={<Navigate to="./../root" />}/>
          </Routes>
        </>
      }/>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

const App = () => {
  return (
    <div className="App">
      <UserManager/>
      <TabManager />
    </div>
  );
}

export default App;
