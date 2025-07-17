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

import { Template } from '../mixins/template'

import { headerTemplate } from './distill-header-template'

const T = Template('distill-header', headerTemplate, false)

export class DistillHeader extends T(HTMLElement) {
  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }

    const submit = this.root.querySelector('#submit-link');
    if (submit) {
      submit.addEventListener('click', async (e: Event) => {
        e.preventDefault();
        try {
          const resp = await fetch('/package.json');
          const pkg = await resp.json();
          let repo: string = pkg.repository?.url || '';
          repo = repo.replace(/^git\+/, '').replace(/\.git$/, '');
          const match = repo.match(/github\.com[:\/](.+)/);
          if (match) {
            const base = 'https://github.com/' + match[1];
            window.open(base.replace(/\.git$/, '') + '/compare', '_blank');
          }
        } catch (err) {
          console.error('Unable to open PR page', err);
        }
      });
    }
  }
}
