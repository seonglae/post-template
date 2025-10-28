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
      if (name === 'archive') continue
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
  doi?: string
  authors?: { author?: string }[]
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
      doi: data.doi,
      authors: data.authors,
      url: path.relative('public', file).replace(/\\/g, '/'),
    }
  } catch {
    return null
  }
}

function renderItem(article: ArticleMeta): string {
  const parts: string[] = []
  parts.push(`<a href="/${article.url}">${article.title}</a>`)

  if (article.doi) {
    const safeDoi = article.doi
    parts.push(
      `<div><a class="doi" href="${safeDoi}" rel="noopener" target="_blank">${safeDoi}</a></div>`
    )
  }

  if (article.published) {
    const publishedDate = new Date(article.published)
    const dateAttr = !isNaN(publishedDate.getTime())
      ? ` data-published-date="${publishedDate.toISOString()}"`
      : ''
    parts.push(`<div${dateAttr}>${article.published}</div>`)
  }

  if (article.authors && article.authors.length > 0) {
    const names = article.authors
      .map(author => author.author)
      .filter((name): name is string => Boolean(name))
      .join(', ')
    if (names) {
      parts.push(`<div>${names}</div>`)
    }
  }

  return `<li>${parts.join('')}</li>`
}

function generateHTML(articles: ArticleMeta[]): string {
  const items = articles.map(renderItem)

  const list =
    items.length > 0
      ? `
        <ul>
          ${items.join('\n          ')}
        </ul>
      `
      : `
        <p class="empty">No articles available yet.</p>
      `

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Archive</title>
    <script src="/template.v2.js"></script>
    <style>
      :root {
        color-scheme: light;
      }

      body {
        margin: 0;
        background-color: hsl(200, 60%, 15%);
      }

      d-article {
        display: block;
        background: white;
        color: rgba(0, 0, 0, 0.8);
        padding-bottom: 72px;
      }

      d-article.centered > h1 {
        margin: 72px 24px 12px;
        font-weight: 400;
        font-family: Cochin, Georgia, serif;
        font-size: 46px;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      @media (min-width: 768px) {
        d-article.centered > h1 {
          margin: 96px 72px 24px;
          font-size: 54px;
        }
      }

      @media (min-width: 1080px) {
        d-article.centered > h1 {
          margin-left: auto;
          margin-right: auto;
          text-align: center;
        }
      }

      .issues {
        margin: 0 24px 48px;
      }

      @media (min-width: 768px) {
        .issues {
          margin-left: 72px;
          margin-right: 72px;
        }
      }

      @media (min-width: 1080px) {
        .issues {
          margin-left: auto;
          margin-right: auto;
          max-width: 648px;
        }
      }

      .issues ul {
        margin-top: 12px;
        padding: 0;
        list-style: none;
      }

      .issues li {
        margin-bottom: 16px;
      }

      .issues li a {
        border-bottom: 1px solid rgba(0, 0, 0, 0.2);
        text-decoration: none;
      }

      .issues li a:hover {
        border-bottom-color: rgba(0, 0, 0, 0.4);
      }

      .issues li div,
      .issues li .doi {
        font-family: -apple-system, BlinkMacSystemFont, "Roboto", Helvetica, sans-serif;
        color: grey;
        font-size: 13px;
        line-height: 20px;
      }

      .empty {
        margin: 48px 0;
        font-family: -apple-system, BlinkMacSystemFont, "Roboto", Helvetica, sans-serif;
        color: rgba(0, 0, 0, 0.6);
        text-align: center;
      }
    </style>
  </head>
  <body>
    <distill-header></distill-header>
    <d-article class="centered">
      <h1>Distill Archive</h1>
      <div class="issues">
        ${list}
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
  .filter((article): article is ArticleMeta => article !== null)
  .sort((a, b) => {
    const aDate = new Date(a.published || '').getTime() || 0
    const bDate = new Date(b.published || '').getTime() || 0
    return bDate - aDate
  })

fs.mkdirSync(archiveDir, { recursive: true })
fs.writeFileSync(path.join(archiveDir, 'index.html'), generateHTML(articles))
