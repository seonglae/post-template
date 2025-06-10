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
import { nodeListToArray } from './helpers'

describe('nodeListToArray', () => {
  it('should convert a NodeList to an array', () => {
    const div = document.createElement('div')
    div.innerHTML = '<p>1</p><p>2</p><p>3</p>'
    const nodeList = div.querySelectorAll('p')
    const array = nodeListToArray(nodeList)
    expect(array).toBeInstanceOf(Array)
    expect(array).toHaveLength(3)
    expect(array[0].textContent).toBe('1')
    expect(array[1].textContent).toBe('2')
    expect(array[2].textContent).toBe('3')
  })
}) 