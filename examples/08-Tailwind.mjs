/**
 * 08-Tailwind.html 的结构验证脚本（第 08 章配套）
 *
 * 用途：CDN 版演示页本身双击即看，但这个 .mjs 用于通过 check.mjs 的
 * `node --check` 语法校验，并验证 HTML 里关键的 Tailwind 类名/结构是否齐备。
 *
 * 运行：node examples/08-Tailwind.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '08-Tailwind.html');

const html = fs.readFileSync(htmlPath, 'utf8');

// 演示页应覆盖第 08 章的核心知识点，逐个验证类名是否出现
const checks = [
  ['Flex 布局', 'flex justify-between items-center'],
  ['Grid 布局', 'grid-cols-3'],
  ['设计令牌-间距', 'p-4'],
  ['响应式前缀', 'sm:grid-cols-2'],
  ['响应式前缀', 'lg:grid-cols-3'],
  ['状态前缀-hover', 'hover:bg-blue-600'],
  ['状态前缀-focus', 'focus-visible:ring-2'],
  ['暗色模式', 'dark:bg-gray-900'],
  ['CDN 引用', 'cdn.tailwindcss.com'],
  ['darkMode class 策略', "darkMode: 'class'"],
];

let pass = 0;
for (const [label, needle] of checks) {
  if (html.includes(needle)) {
    console.log('  OK   ' + label + '  (' + needle + ')');
    pass += 1;
  } else {
    console.log('  MISS ' + label + '  (' + needle + ')');
  }
}

console.log('\n' + pass + '/' + checks.length + ' 项结构检查通过');
if (pass !== checks.length) {
  process.exitCode = 1;
}
