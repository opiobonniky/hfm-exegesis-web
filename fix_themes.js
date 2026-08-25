const fs = require('fs');
const esbuild = require('esbuild');

const themes = fs.readdirSync('features')
  .filter(d => fs.existsSync('features/' + d + '/theme/theme.ts'))
  .map(d => 'features/' + d + '/theme/theme.ts');

for (const f of themes) {
  let code = fs.readFileSync(f, 'utf8');
  try { esbuild.transformSync(code, { loader: 'ts', target: 'esnext' }); continue; } catch {}
  let b = 0;
  let inStr = false, sc = '';
  for (const c of code) {
    if (inStr) { if (c === sc) inStr = false; continue; }
    if (c === '"' || c === "'") { inStr = true; sc = c; continue; }
    if (c === '{') b++;
    if (c === '}') b--;
  }
  if (b > 0) {
    code = code.replace(/\s*$/, '\n' + '}'.repeat(b) + '\n');
    fs.writeFileSync(f, code);
    try { esbuild.transformSync(code, { loader: 'ts', target: 'esnext' }); console.log('FIXED: ' + f); }
    catch (e) { console.log('STILL BROKEN: ' + f); }
  } else {
    console.log('NEEDS MANUAL: ' + f);
  }
}
