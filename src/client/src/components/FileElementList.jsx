import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { UL, Spinner, Icon } from "@blueprintjs/core";
import { useSelector } from 'react-redux';

import FileElement from './FileElement';
import { addToPath } from '../services/pathSlice';
import { selectDirectoryTree } from '../services/directoryTreeSlice';

const listStyle = {
  listStyle: 'none',
  // border: '1px solid #cccccc',
  // padding: '0.6rem',
  // cursor: 'pointer'
}


const elementStyle = {
  display: 'grid',
  gridTemplateColumns: '30px 1fr repeat(2, 8rem) 4.7rem',
  padding: '0.6rem',
  cursor: 'pointer',
  // border: '1px solid #ccc',
  fontSize: '1rem',
  borderRadius: '2px'
};

const FileElementList = ({files, setFilesList}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const directoryTree = useSelector(selectDirectoryTree);

  function fileClickHandler(file) {
    console.log("double click", file);
    if (file.mimeType === "application/vnd.google-apps.folder")
    {
      setFilesList(null);
      dispatch(addToPath(file));
      navigate('/' + file.id);
    }
    // Non-Folder File click is handled in FileElement.jsx
  }

  if (files===null)
    return (<><Spinner/></>);

  if (files.length === 0)
    return (<>No files to show</>);

  return (
    <UL>
      <li style={listStyle}>
        <div style={elementStyle}>
          <span style={{gridColumn: '1 / span 2', display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: '4px'}}>File Name</span>
            <Icon icon='caret-down' color='#777' size={13}/>
          </span>
          <span style={{display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: '5px'}}>Last Viewed</span>
            <Icon icon='double-caret-vertical' color='#777' size={13}/>
          </span>
          <span style={{display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: '5px'}}>Last Modifed</span>
            <Icon icon='double-caret-vertical' color='#777' size={13}/>
          </span>
          <span style={{display: 'flex', alignItems: 'center', margin: 'auto'}}>
            <span style={{marginRight: '5px'}}>Size</span>
            <Icon icon='double-caret-vertical' color='#777' size={13}/>
          </span>
        </div>
      </li>
      {files.map(file => (
        <li style={listStyle} key={file.id} onDoubleClick={() => fileClickHandler(file)}>
          <FileElement file={file} directoryTree={directoryTree}/>
        </li>
      ))}
    </UL>
    );
}

export default FileElementList;