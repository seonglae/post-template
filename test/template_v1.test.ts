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
import { JSDOM } from 'jsdom'

import * as distill from '../src/template_v1'

interface Distill {
  render: Function
  html: (doc: Document, options: any) => void
  styles: Function
}

describe('Distill v1', () => {
  describe('render', () => {
    it('Should have a render function.', () => {
      expect(distill.render).toBeInstanceOf(Function)
    })
  })

  //
  // html
  //
  describe('html', () => {
    it('Should have a html function.', () => {
      expect(distill.html).toBeInstanceOf(Function)
    })
    
    it('Should add a language attribute to html element, if not present.', () => {
      const doc = new JSDOM('').window.document
      const before = doc.documentElement.outerHTML
      distill.html(doc, {})
      const after = doc.documentElement.outerHTML
      expect(after).toMatch(new RegExp('<html lang="en">'))
    })

    it('Should not add a language attribute to html element, if already present.', () => {
      const doc = new JSDOM('<html lang="ab">').window.document
      const before = doc.documentElement.outerHTML
      distill.html(doc, {})
      const after = doc.documentElement.outerHTML
      expect(after).not.toMatch(new RegExp('lang="en"'))
    })

    it('Should add a meta charset tag, if not present.', () => {
      const doc = new JSDOM('').window.document
      const before = doc.documentElement.outerHTML
      distill.html(doc, {})
      const after = doc.documentElement.outerHTML
      expect(after).toMatch(new RegExp('<meta charset="utf-8">'))
    })

    it('Should add a meta viewport tag, if not present.', () => {
      const doc = new JSDOM('').window.document
      const before = doc.documentElement.outerHTML
      distill.html(doc, {})
      const after = doc.documentElement.outerHTML
      expect(after).toMatch(new RegExp('<meta name="viewport" content="width=device-width, initial-scale=1">'))
    })
  })

  //
  // styles
  //
  describe('styles', () => {
    it('Should have a styles function.', () => {
      expect(distill.styles).toBeInstanceOf(Function)
    })
  })
}) 