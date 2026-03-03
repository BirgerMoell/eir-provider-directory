import fs from 'fs'
import path from 'path'

function getHeader(req, key) {
  if (!req || !req.headers) return undefined
  if (typeof req.headers.get === 'function') {
    return req.headers.get(key) || undefined
  }
  return req.headers[key] || req.headers[key.toLowerCase()] || undefined
}

function getBaseUrl(req) {
  const host = getHeader(req, 'host')
  const proto = getHeader(req, 'x-forwarded-proto') || 'https'
  if (!host) return null
  return `${proto}://${host}`
}

function readFromFs(filename) {
  const filePath = path.join(process.cwd(), 'public/data', filename)
  if (!fs.existsSync(filePath)) return null
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return data
}

async function readFromAssets(req, filename) {
  const baseUrl = getBaseUrl(req)
  if (!baseUrl) return null
  const response = await fetch(`${baseUrl}/data/${filename}`)
  if (!response.ok) return null
  return response.json()
}

export async function loadProviderDataset(req, options = {}) {
  const useSample = options.useSample === true
  const candidates = useSample
    ? ['providers-sweden-sample.json']
    : ['providers-sweden-verified.json', 'providers-sweden.json']

  for (const filename of candidates) {
    try {
      const fsData = readFromFs(filename)
      if (fsData) return fsData
    } catch {
      // Fall through to asset lookup.
    }
  }

  for (const filename of candidates) {
    try {
      const assetData = await readFromAssets(req, filename)
      if (assetData) return assetData
    } catch {
      // Try next candidate.
    }
  }

  throw new Error('Provider data not found')
}
