import { useState } from 'react';
import { Button, ButtonGroup, Text } from "@blueprintjs/core";

import FileUpload from './FileUpload';
import { useDispatch, useSelector } from 'react-redux';
import { clearClipboard, selectClipboard, setClipboard } from '../services/clipboardSlice';
import { renameEntity, moveEntitiesToFolder } from '../services/fileManagerService';

function moveToClipboard(entities, mode, dispatch) {
  dispatch(setClipboard({entities, mode}));
}

function pasteToFolder(clipboard, targetFolderID, credentials, dispatch) {
    // if directoryTree is not built, changes will not reflect on the screen.

  if (clipboard.mode === 'cut') {
    moveEntitiesToFolder(clipboard.entities, targetFolderID, credentials)
      .then(results => {
        console.log("Successfully moved", results);
        dispatch(clearClipboard());
      })
  }
}

function renameSelectedFile(entityID, credentials) {
  // TODO: renameEntity will only reflect on screen after directory tree is initialized.
  const newName = prompt("Enter new file name");

  if (!newName) return;

  renameEntity(entityID, newName, credentials)
    .then(result => {
      console.log(result);
    })
}

const ToolBar = ({ highlightedEntitiesList, user, targetFolderID, viewMode, setViewMode }) => {
  const [overlayState, setOverlayState] = useState(false);
  const clipboard = useSelector(selectClipboard);
  const dispatch = useDispatch();

  return (
    <div className="ToolBar">
      <FileUpload isOpen={overlayState} onClose={() => setOverlayState(false)} user={user} targetFolderID={targetFolderID}/>
      <Button small minimal icon='add' rightIcon="chevron-down" text="New" onClick={() => setOverlayState(true)}/>
      <ButtonGroup>
        <Button small minimal icon='cut'
          className={highlightedEntitiesList.length ? '':'Hidden'}
          text="Cut"
          onClick={() => moveToClipboard(highlightedEntitiesList, 'cut', dispatch)}
        />
        <Button small minimal icon='duplicate'
          className={highlightedEntitiesList.length ? '':'Hidden'}
          text="Copy"
          onClick={() => moveToClipboard(highlightedEntitiesList, 'copy', dispatch)}
        />
        <Button small minimal icon='clipboard'
          className={clipboard.entities.length ? '':'Hidden'}
          text="Paste"
          onClick={() => pasteToFolder(clipboard, targetFolderID, user, dispatch)}
        />
      </ButtonGroup>
      <Button small minimal icon='edit'
        className={highlightedEntitiesList.length===1 ? '':'Hidden'}
        text="Rename"
        onClick={() => renameSelectedFile(highlightedEntitiesList[0].id, user)}
      />
      <Button small minimal intent='danger' icon='trash'
        className={highlightedEntitiesList.length ? '':'Hidden'}
        text="Trash"
      />
      
      <div style={{alignItems: 'stretch', overflow: 'hidden', marginLeft: 'auto', marginRight: '2rem', display: 'flex'}}>
        <span style={{display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: '600', color: '#777', fontSize: '0.85rem'}}>
          Display
        </span>
        <ButtonGroup>
          <Button small style={{padding: '0 15px'}} icon='grid'
            onClick={() => setViewMode('icon-view')}
            active={viewMode === 'icon-view'}
          />
          <Button small style={{padding: '0 15px'}} icon='th'
            onClick={() => setViewMode('detail-view')}
            active={viewMode === 'detail-view'}
          />
          <Button small style={{padding: '8px 15px'}} icon='diagram-tree'
            onClick={() => setViewMode('tree-view')}
            active={viewMode === 'tree-view'}
          />
          <Button small style={{padding: '0 15px'}} icon='list-columns'
            onClick={() => setViewMode('list-view')}
            active={viewMode === 'list-view'}
          />
          <Button small style={{padding: '0 15px'}} icon='two-columns'
            onClick={() => setViewMode('column-view')}
            active={viewMode === 'column-view'}
          />
        </ButtonGroup>
      </div>
    </div>
    );
}

export default ToolBar;
