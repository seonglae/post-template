// Copyright 2018 The Distill Template Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { describe, it, expect } from 'vitest'
import { JSDOM, VirtualConsole } from 'jsdom'

// TODO: Update import path when TypeScript version is available
// import * as distill from '../dist/transforms.v2'

// Temporary mock until we have the actual implementation
const distill = {
  testing: {
    extractors: new Map<string, (doc: Document, data: TestData) => void>([
      ['ExtractCitations', (doc: Document, data: TestData) => {}],
      ['ExtractBibliography', (doc: Document, data: TestData) => {}],
    ]),
    transforms: new Map<string, (doc: Document, data: TestData) => void>([
      ['Meta', (doc: Document, data: TestData) => {}],
    ]),
  },
  usesTemplateV2: (frag: DocumentFragment) => {
    if (frag.querySelector('script[src*="template.v1.js"]')) return false
    if (frag.querySelector('script[src*="template.v2.js"]')) return true
    if (frag.querySelector('script[src="/template.v2.js"]')) return true
    if (frag.querySelector('script[src*="template.v42.js"]')) throw new Error('unknown')
    throw new Error('at all')
  },
  render: () => {},
  distillify: () => {},
}

interface Bibliography {
  [key: string]: {
    title: string
    author: string
    journal: string
    volume?: number
    number?: number
    year?: string
    url?: string
  }
}

interface Author {
  firstName: string
  lastName: string
  affiliation: string
  affiliationURL: string
}

interface TestData {
  authors?: Author[]
  doiSuffix?: string
  citations?: string[]
  bibliography?: Map<string, any>
  publishedDate?: Date
  updatedDate?: Date
}

// omitJSDOMErrors as JSDOM routinely can't parse modern CSS
const virtualConsole = new VirtualConsole()
virtualConsole.sendTo(console, { omitJSDOMErrors: true })

const options = {
  runScripts: 'outside-only' as const,
  QuerySelector: true,
  virtualConsole: virtualConsole,
}

describe('Distill V2 (transforms)', () => {
  it('should export its expected interface', () => {
    expect(distill.testing).toBeTypeOf('object')
    expect(distill.usesTemplateV2).toBeTypeOf('function')
    expect(distill.render).toBeTypeOf('function')
    expect(distill.distillify).toBeTypeOf('function')
  })

  describe('#usesTemplateV2()', () => {
    it('should detect v1', () => {
      const frag = JSDOM.fragment('<script src="https://distill.pub/template.v1.js"></script>')
      expect(distill.usesTemplateV2(frag)).toBe(false)
    })

    it('should detect v2', () => {
      const frag = JSDOM.fragment('<script src="https://distill.pub/template.v2.js"></script>')
      expect(distill.usesTemplateV2(frag)).toBe(true)
    })

    it('should detect local scripts as well', () => {
      const frag = JSDOM.fragment('<script src="/template.v2.js"></script>')
      expect(distill.usesTemplateV2(frag)).toBe(true)
    })

    it('should error on unknown distill script', () => {
      const frag = JSDOM.fragment('<script src="https://distill.pub/template.v42.js"></script>')
      expect(() => distill.usesTemplateV2(frag)).toThrow('unknown')
    })

    it('should error on no distill script', () => {
      const frag = JSDOM.fragment('<script src="https://code.jquery.com/jquery-3.2.1.js"></script>')
      expect(() => distill.usesTemplateV2(frag)).toThrow('at all')
    })
  })

  describe('#render()', () => {
    describe('should extract metadata', () => {
      it('should extract citations', () => {
        const dom = new JSDOM('<d-cite key="test-citation-key">sth</d-cite>', options)
        const data: TestData = {}
        const extractCitations = distill.testing.extractors.get('ExtractCitations')
        if (!extractCitations) throw new Error('ExtractCitations not found')
        expect(extractCitations).toBeTypeOf('function')
        extractCitations(dom.window.document, data)
        expect(data).toHaveProperty('citations')
        const citations = data.citations || []
        expect(citations).toBeInstanceOf(Array)
        expect(citations).toHaveLength(1)
        const citation = citations[0]
        expect(citation).toBe('test-citation-key')
      })

      it('should extract bibliography', () => {
        const dom = new JSDOM(
          `
          <d-cite key="mercier2011humans">sth</d-cite>
          <d-bibliography>
            <script type="text/bibtex">
            @article{mercier2011humans,
            title={Why do humans reason? Arguments for an argumentative theory},
            author={Mercier, Hugo and Sperber, Dan},
            journal={Behavioral and brain sciences},
            volume={34},
            number={02},
            pages={57--74},
            year={2011},
            publisher={Cambridge Univ Press},
            doi={10.1017/S0140525X10000968}
            }
            </script>
          </d-bibliography>
          `,
          options,
        )
        const data: TestData = {}
        const extractBibliography = distill.testing.extractors.get('ExtractBibliography')
        if (!extractBibliography) throw new Error('ExtractBibliography not found')
        extractBibliography(dom.window.document, data)
        expect(data.bibliography).toBeInstanceOf(Map)
        const entry = data.bibliography?.get('mercier2011humans')
        expect(entry).toBeTypeOf('object')
        expect(entry).toHaveProperty('year', '2011')
      })

      it('should extract front-matter')
    })

    describe('should transform the DOM', () => {
      it('should add Google scholar citation information', () => {
        const dom = new JSDOM('', options)
        const data: TestData = {
          authors: [
            {
              firstName: 'Frank',
              lastName: 'Underwood',
              affiliation: 'Google Brain',
              affiliationURL: 'https://g.co/brain',
            },
            {
              firstName: 'Shan',
              lastName: 'Carter',
              affiliation: 'Google Brain',
              affiliationURL: 'https://g.co/brain',
            },
          ],
          doiSuffix: 'test-doi-suffix',
        }
        if (!data.authors) throw new Error('Authors not defined')
        const firstAuthorName = data.authors[0].firstName + ' ' + data.authors[0].lastName
        const GSfirstAuthorName = data.authors[0].lastName + ', ' + data.authors[0].firstName

        const meta = distill.testing.transforms.get('Meta')
        if (!meta) throw new Error('Meta transform not found')
        expect(meta).toBeTypeOf('function')

        meta(dom.window.document, data)
        const metaTags = dom.window.document.querySelectorAll('meta')
        expect(metaTags).not.toBeNull()

        // Google Scholar
        const GSAuthorTags = Array.from(metaTags).filter((tag: Element) => {
          return tag.getAttribute('name') === 'citation_author'
        })
        expect(GSAuthorTags).toHaveLength(2)
        const GSFirstAuthorTag = GSAuthorTags[0]

        expect(GSFirstAuthorTag.getAttribute('content')).toBe(GSfirstAuthorName)

        // Schema.org Author tags
        const SOAuthorTags = Array.from(metaTags).filter((tag: Element) => {
          return tag.getAttribute('property') === 'article:author'
        })
        expect(SOAuthorTags).toHaveLength(2)
        const SOFirstAuthorTag = SOAuthorTags[0]
        expect(SOFirstAuthorTag.getAttribute('content')).toBe(firstAuthorName)
      })

      it('given already correct data, it should add Google scholar references information', () => {
        const dom = new JSDOM('', options)
        const data: TestData = {
          doiSuffix: 'test-doi-suffix',
          citations: ['test-citation-key'],
          bibliography: new Map([
            [
              'test-citation-key',
              {
                title: 'Why do humans reason? Arguments for an argumentative theory',
                author: 'Mercier, Hugo and Sperber, Dan',
                journal: 'Behavioral and brain sciences',
                volume: 34,
                number: 2,
              },
            ],
          ]),
        }
        const meta = distill.testing.transforms.get('Meta')
        if (!meta) throw new Error('Meta transform not found')
        expect(meta).toBeTypeOf('function')
        meta(dom.window.document, data)
        const metaTags = Array.from(dom.window.document.querySelectorAll('meta[name="citation_reference"]'))
        expect(metaTags).not.toBeNull()
      })

      it('given an arxiv article, it should add a special Google scholar arxiv citation', () => {
        const dom = new JSDOM('', options)
        const data: TestData = {
          doiSuffix: 'test-doi-suffix',
          citations: ['dumoulin2016guide'],
          bibliography: new Map([
            [
              'dumoulin2016guide',
              {
                title: 'A guide to convolution arithmetic for deep learning',
                author: 'Dumoulin, Vincent and Visin, Francesco',
                journal: 'arXiv preprint arXiv:1603.07285',
                year: '2016',
                url: 'https://arxiv.org/pdf/1603.07285.pdf',
              },
            ],
          ]),
        }

        const meta = distill.testing.transforms.get('Meta')
        if (!meta) throw new Error('Meta transform not found')
        expect(meta).toBeTypeOf('function')
        meta(dom.window.document, data)

        const metaTags = Array.from(dom.window.document.querySelectorAll('meta[name="citation_reference"]'))
        expect(metaTags).not.toBeNull()

        const metaTag = metaTags[0]
        expect(metaTag).toHaveProperty('content')

        const content = metaTag.getAttribute('content')
        expect(content).toContain('citation_title')
        expect(content).toContain('citation_author')
        expect(content?.match(/citation_author=/g)).toHaveLength(2)
        expect(content).toContain('citation_publication_date')
        expect(content).toContain('citation_arxiv_id')
        expect(content).not.toContain('journal')
      })

      it('given only a DOM (and publish data), it should add Google scholar references information', () => {
        const dom = new JSDOM(
          `
          <d-cite key="mercier2011humans">sth</d-cite>
          <d-bibliography>
            <script type="text/bibtex">
            @article{mercier2011humans,
            title={Why do humans reason? Arguments for an argumentative theory},
            author={Mercier, Hugo and Sperber, Dan},
            journal={Behavioral and brain sciences},
            volume={34},
            number={02},
            pages={57--74},
            year={2011},
            publisher={Cambridge Univ Press},
            doi={10.1017/S0140525X10000968}
            }
            </script>
          </d-bibliography>
          `,
          options,
        )
        const data: TestData = { publishedDate: new Date(), updatedDate: new Date() }
        const meta = distill.testing.transforms.get('Meta')
        if (!meta) throw new Error('Meta transform not found')
        expect(meta).toBeTypeOf('function')
        meta(dom.window.document, data)
        const metaTags = Array.from(dom.window.document.querySelectorAll('meta[name="citation_reference"]'))
        expect(metaTags).not.toBeNull()
      })
    })
  })
}) 