const DB_NAME = 'worklog_db'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

// Save a single image, keyed by a unique id
export async function saveImage(id, dataUrl) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(dataUrl, id)
    tx.oncomplete = () => resolve()
    tx.onerror = e => reject(e.target.error)
  })
}

// Load a single image by id
export async function loadImage(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(id)
    req.onsuccess = e => resolve(e.target.result || null)
    req.onerror = e => reject(e.target.error)
  })
}

// Delete a single image by id
export async function deleteImage(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = e => reject(e.target.error)
  })
}

// Delete multiple images
export async function deleteImages(ids) {
  if (!ids?.length) return
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    ids.forEach(id => store.delete(id))
    tx.oncomplete = () => resolve()
    tx.onerror = e => reject(e.target.error)
  })
}
