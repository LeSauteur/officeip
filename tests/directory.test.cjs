const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const offices=JSON.parse(html.match(/const offices = (\[[\s\S]*?\]);/)[1]);
const inactive=JSON.parse(html.match(/const inactiveIds = (\[.*?\]);/)[1]);
const orlov=JSON.parse(html.match(/const orlovOfficeIds = (\[.*?\]);/)[1]);
test('inline scripts compile and all local anchors resolve',()=>{
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(ids.length,new Set(ids).size);
 for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),match[1]);
});
test('closed offices are removed and remaining office records are complete',()=>{
 assert.equal(offices.length,77);
 assert.equal(new Set(offices.map(o=>o.id)).size,77);
 assert.doesNotMatch(JSON.stringify(offices),/Баев|Князев|Котовская/);
 assert.ok(offices.every(o=>![2,21,23].includes(o.id)));
 for(const office of offices){assert.ok(office.name);assert.ok(office.address);assert.ok(office.owner);}
});
test('active and archived office groups remain valid and separate',()=>{
 const ids=new Set(offices.map(o=>o.id));
 for(const id of [...inactive,...orlov])assert.ok(ids.has(id),String(id));
 assert.ok(orlov.every(id=>!inactive.includes(id)));
 assert.equal(inactive.length,9);assert.equal(orlov.length,9);
 assert.equal(offices.filter(o=>!inactive.includes(o.id)).length,68);
 assert.ok(offices.some(o=>o.id===7&&o.address.includes('Маяковского')));
 assert.ok(offices.some(o=>o.id===54&&o.address.includes('Шевченко')));
});
