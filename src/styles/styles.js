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

import base from './styles-base.css?raw';
import layout from './styles-layout.css?raw';
import print from './styles-print.css?raw';
import byline from './d-byline.css?raw';
import article from './d-article.css?raw';
import title from './d-title.css?raw';
import math from './d-math.css?raw';

export const styles = base + layout + title + byline + article + math + print;

export function makeStyleTag(dom) {

  const styleTagId = 'distill-prerendered-styles';
  const prerenderedTag = dom.getElementById(styleTagId);
  if (!prerenderedTag) {
    const styleTag = dom.createElement('style');
    styleTag.id = styleTagId;
    styleTag.type = 'text/css';
    const cssTextTag = dom.createTextNode(styles);
    styleTag.appendChild(cssTextTag);
    const firstScriptTag = dom.head.querySelector('script');
    dom.head.insertBefore(styleTag, firstScriptTag);
  }

}
