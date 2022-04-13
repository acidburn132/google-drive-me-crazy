import axios from 'axios';

const baseUrlDriveAPI = 'https://www.googleapis.com/drive/v3'

export function renameEntity(entityID, newName, credentials) {
  return axios.patch(baseUrlDriveAPI + '/files/' + entityID, {
    name: newName  
  },
  {
    headers: { Authorization: `Bearer ${credentials.accessToken}`},
    params: {
      fields: '*',
    }
  })
  .then(res => res.data);
}

export function changeParentFolder(entity, newParentID, credentials) {
  return axios.patch(baseUrlDriveAPI + '/files/' + entity.id,
  {},
  {
    headers: { Authorization: `Bearer ${credentials.accessToken}`},
    params: {
      fields: '*',
      removeParents: entity.parents[0],
      addParents: newParentID,
    }
  })
  .then(res => res.data);
}