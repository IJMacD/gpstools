export const TRACK_ADD = 'TRACK_ADD'
export const TRACK_EDIT = 'TRACK_EDIT'
export const TRACK_REMOVE = 'TRACK_REMOVE'

export function addTrack(track) {
  return {
    type: TRACK_ADD,
    track
  }
}

export function editTrack(id, track) {
  return {
    type: TRACK_EDIT,
    id,
    track
  }
}

export function removeTrack(id) {
  return {
    type: TRACK_REMOVE,
    id
  }
}
