import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function saveDataPlugin() {
  return {
    name: 'save-data',
    configureServer(server) {
      server.middlewares.use('/api/save-data', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { key, data } = JSON.parse(body)
            if (!['projects', 'logs', 'history'].includes(key)) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'invalid key' }))
              return
            }
            const filePath = path.resolve('public/data', `${key}.json`)
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), saveDataPlugin()],
})
