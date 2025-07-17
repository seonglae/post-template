import HTML from './transforms/html'
import { makeStyleTag } from './styles/styles'

export function render(doc: Document, _options: any = {}) {
  html(doc, _options)
  styles(doc)
}

export function html(doc: Document, _options: any = {}) {
  HTML(doc)
}

export function styles(doc: Document) {
  makeStyleTag(doc)
}

export default { render, html, styles }
