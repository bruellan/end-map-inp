#!/usr/bin/env node
/**
 * figma-export.js — export PNGs from a Figma file via the REST API.
 *
 * Usage:
 *   FIGMA_TOKEN=figd_xxx node figma-export.js <fileKeyOrUrl> [options]
 *
 * Options:
 *   --out <dir>        Output directory            (default: ./export)
 *   --scale <list>     Scales, comma separated     (default: 2)
 *   --type <list>      Node types to export        (default: COMPONENT,COMPONENT_SET)
 *   --page <name>      Only this page              (default: all pages)
 *   --nodes <ids>      Explicit node ids, skips the tree walk
 *   --exports-only     Only nodes that have export settings in Figma
 *   --format <fmt>     png | jpg | svg | pdf       (default: png)
 *   --batch <n>        Ids per /images request     (default: 50)
 *   --concurrency <n>  Parallel downloads          (default: 8)
 *   --dry-run          List what would be exported, download nothing
 *
 * Example:
 *   FIGMA_TOKEN=figd_xxx node figma-export.js \
 *     https://www.figma.com/design/AbCd1234/My-File \
 *     --page Icons --scale 1,2,3 --out ./assets
 */

const fs = require('fs')
const path = require('path')

const API = 'https://api.figma.com/v1'

// ---------------------------------------------------------------- args

function parseArgs(argv) {
  const opts = {
    out: 'export',
    scale: '2',
    type: 'COMPONENT,COMPONENT_SET',
    format: 'png',
    batch: '50',
    concurrency: '8',
  }
  let positional = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--exports-only') opts.exportsOnly = true
    else if (a === '--dry-run') opts.dryRun = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else positional = a
  }
  opts._file = positional
  return opts
}

function fileKeyFrom(input) {
  if (!input) return null
  const m = input.match(/figma\.com\/(?:file|design|proto)\/([A-Za-z0-9]+)/)
  return m ? m[1] : input
}

// ---------------------------------------------------------------- api

async function figma(url, token) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'X-Figma-Token': token } })
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after') || 2 ** attempt)
      console.warn(`  ${res.status} — retrying in ${wait}s`)
      await sleep(wait * 1000)
      continue
    }
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`)
    }
    const json = await res.json()
    if (json.err) throw new Error(`Figma error: ${json.err}`)
    return json
  }
  throw new Error('Too many retries')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- tree

function collect(node, wanted, opts, page, acc) {
  if (node.type === 'CANVAS') {
    if (opts.page && node.name !== opts.page) return acc
    page = node.name
  }
  const typeOk = wanted.has(node.type)
  const exportOk = !opts.exportsOnly || (node.exportSettings || []).length > 0
  if (typeOk && exportOk && node.id) {
    acc.push({ id: node.id, name: node.name, page })
  }
  for (const child of node.children || []) collect(child, wanted, opts, page, acc)
  return acc
}

function safeName(nodes) {
  const seen = new Map()
  return nodes.map((n) => {
    let base =
      n.name
        .replace(/[/\\]+/g, '-')
        .replace(/[^\w.\-@ ]+/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 80) || n.id.replace(':', '-')
    const count = seen.get(base) || 0
    seen.set(base, count + 1)
    if (count) base = `${base}-${count + 1}`
    return { ...n, file: base }
  })
}

// ---------------------------------------------------------------- run

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const token = process.env.FIGMA_TOKEN
  const key = fileKeyFrom(opts._file)

  if (!token) fail('Set FIGMA_TOKEN (a personal access token with file read scope).')
  if (!key) fail('Pass a Figma file URL or file key as the first argument.')

  const scales = opts.scale.split(',').map((s) => Number(s.trim()))
  const batchSize = Number(opts.batch)

  // 1. figure out which nodes to export
  let nodes
  if (opts.nodes) {
    nodes = opts.nodes.split(',').map((id) => ({ id: id.trim(), name: id.trim(), page: '' }))
  } else {
    console.log('Fetching file tree…')
    const doc = await figma(`${API}/files/${key}?depth=4`, token)
    const wanted = new Set(opts.type.split(',').map((t) => t.trim().toUpperCase()))
    nodes = collect(doc.document, wanted, opts, '', [])
    console.log(`Found ${nodes.length} node(s) matching ${[...wanted].join(', ')}`)
  }
  if (!nodes.length) fail('Nothing to export. Try --type FRAME or drop --exports-only.')
  nodes = safeName(nodes)

  if (opts.dryRun) {
    for (const n of nodes) console.log(`  ${n.id}  ${n.page ? n.page + ' / ' : ''}${n.file}`)
    return
  }

  fs.mkdirSync(opts.out, { recursive: true })

  // 2. ask Figma to render, one request per scale per batch
  const jobs = []
  for (const scale of scales) {
    for (let i = 0; i < nodes.length; i += batchSize) {
      const chunk = nodes.slice(i, i + batchSize)
      const ids = chunk.map((n) => n.id).join(',')
      const url = `${API}/images/${key}?ids=${encodeURIComponent(ids)}&format=${opts.format}&scale=${scale}`
      console.log(`Rendering ${chunk.length} node(s) @${scale}x…`)
      const { images } = await figma(url, token)
      for (const n of chunk) {
        const src = images[n.id]
        if (!src) {
          console.warn(`  ! no image returned for ${n.name} (${n.id})`)
          continue
        }
        const suffix = scales.length > 1 && scale !== 1 ? `@${scale}x` : ''
        jobs.push({ src, dest: path.join(opts.out, `${n.file}${suffix}.${opts.format}`) })
      }
    }
  }

  // 3. download with bounded concurrency
  let done = 0
  const limit = Number(opts.concurrency)
  const queue = [...jobs]
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) {
        const job = queue.shift()
        const res = await fetch(job.src)
        if (!res.ok) {
          console.warn(`  ! download failed: ${path.basename(job.dest)}`)
          continue
        }
        fs.writeFileSync(job.dest, Buffer.from(await res.arrayBuffer()))
        console.log(`  [${++done}/${jobs.length}] ${path.basename(job.dest)}`)
      }
    }),
  )

  console.log(`\nDone — ${done} file(s) in ${path.resolve(opts.out)}`)
}

function fail(msg) {
  console.error(`Error: ${msg}`)
  process.exit(1)
}

main().catch((e) => fail(e.message))
