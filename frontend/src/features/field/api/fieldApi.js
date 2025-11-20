import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fieldApi = {
  // Sync
  syncTasks: (tasks) => axios.post(`${BASE_URL}/api/field/sync/tasks`, tasks),
  getSyncStatus: (deviceId) => axios.get(`${BASE_URL}/api/field/sync/status`, { params: { device_id: deviceId } }),
  getSyncQueue: (deviceId) => axios.get(`${BASE_URL}/api/field/sync/queue/${deviceId}`),

  // Session
  startSession: (data) => axios.post(`${BASE_URL}/api/field/session/start`, data),
  endSession: (sessionId) => axios.post(`${BASE_URL}/api/field/session/end`, { session_id: sessionId }),
  getActiveSessions: () => axios.get(`${BASE_URL}/api/field/sessions/active`),

  // Offline Tasks
  getOfflineTasks: (deviceId) => axios.get(`${BASE_URL}/api/field/offline-tasks/${deviceId}`),
  createOfflineTask: (data) => axios.post(`${BASE_URL}/api/field/offline-tasks`, data),

  // Photos & Signatures
  uploadPhoto: (formData) => axios.post(`${BASE_URL}/api/field/upload/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadSignature: (data) => axios.post(`${BASE_URL}/api/field/upload/signature`, data),
}