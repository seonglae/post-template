#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

function getAllHtmlFiles(dir: string): string[] {
  const files: string[] = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      files.push(...getAllHtmlFiles(full))
    } else if (name.endsWith('.html')) {
      files.push(full)
    }
  }
  return files
}

interface ArticleMeta {
  title: string
  published?: string
  authors?: { author: string }[]
  url: string
}

function parseMeta(file: string): ArticleMeta | null {
  const html = fs.readFileSync(file, 'utf8')
  const dom = new JSDOM(html)
  const script = dom.window.document.querySelector('#distill-front-matter')
  if (!script || !script.textContent) return null
  try {
    const data = JSON.parse(script.textContent)
    return {
      title: data.title,
      published: data.published || data.publishedDate,
      authors: data.authors,
      url: path.relative('public', file).replace(/\\/g, '/'),
    }
  } catch {
    return null
  }
}

function generateHTML(articles: ArticleMeta[]): string {
  const items = articles
    .map(a => {
      const date = a.published ? `<div>${a.published}</div>` : ''
      const authors = a.authors ? `<div>${a.authors.map(p => p.author).join(', ')}</div>` : ''
      return `<li><a href="/${a.url}">${a.title}</a>${date}${authors}</li>`
    })
    .join('\n          ')

  return `<!doctype html>
<html>
  <head>
    <script src="/template.v2.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta charset="utf-8" />
    <title>Archive</title>
  </head>
  <body>
    <distill-header></distill-header>
    <d-title><h1>Archive</h1></d-title>
    <d-article>
      <div class="issues">
        <ul>
          ${items}
        </ul>
      </div>
    </d-article>
    <distill-footer></distill-footer>
  </body>
</html>`
}

const publicDir = path.join(process.cwd(), 'public')
const archiveDir = path.join(publicDir, 'archive')
const articles = getAllHtmlFiles(publicDir)
  .map(parseMeta)
  .filter((a): a is ArticleMeta => a !== null)
  .sort((a, b) => {
    const aDate = new Date(a.published || '').getTime()
    const bDate = new Date(b.published || '').getTime()
    return bDate - aDate
  })

fs.mkdirSync(archiveDir, { recursive: true })
fs.writeFileSync(path.join(archiveDir, 'index.html'), generateHTML(articles))
