const fs = require('fs');
let js = fs.readFileSync('/home/ubuntu/.openclaw/workspace/heartwise/src/js-app.js', 'utf8');

const pathwayFn = `
// ===== TOOL PATHWAY CONNECTOR =====
function hwPathway(position, actions, nextTool){
  var h='<div style="margin-top:20px;padding:20px;background:linear-gradient(160deg,var(--bg2),rgba(200,168,124,.03));border:1px solid var(--border2);border-radius:12px">';
  h+='<div style="font-size:14px;font-weight:600;color:var(--text);line-height:1.6;margin-bottom:16px;font-family:var(--font-serif)">'+position+'</div>';
  if(actions&&actions.length){
    h+='<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px">\\u2705 Your Top Actions</div>';
    actions.forEach(function(a,i){
      var timeColor=a.when==='this week'?'var(--red)':a.when==='this month'?'var(--accent)':'var(--text3)';
      h+='<div style="display:flex;gap:10px;padding:10px 12px;background:var(--bg);border-radius:8px;margin-bottom:6px;border-left:3px solid '+(i===0?'var(--green)':i===1?'var(--accent)':'var(--text3)')+'">';
      h+='<div style="font-size:16px;font-weight:700;color:var(--accent);flex-shrink:0;width:20px;text-align:center">'+(i+1)+'</div>';
      h+='<div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--text);line-height:1.5">'+a.text+'</div>';
      h+='<div style="font-size:10px;color:'+timeColor+';font-weight:500;margin-top:3px">\\u23f0 '+a.when+'</div></div></div>';
    });
  }
  if(nextTool){
    h+='<div style="margin-top:14px;padding:14px;background:var(--accent-dim);border:1px solid var(--border2);border-radius:10px;cursor:pointer;transition:all .2s" onclick="openFramework(\\''+nextTool.id+'\\')" onmouseenter="this.style.transform=\\'translateY(-1px)\\'" onmouseleave="this.style.transform=\\'none\\'">';
    h+='<div style="display:flex;align-items:center;gap:10px">';
    h+='<div style="font-size:22px;flex-shrink:0">'+nextTool.icon+'</div>';
    h+='<div style="flex:1"><div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">YOUR NEXT STEP \\u2192</div>';
    h+='<div style="font-size:13px;font-weight:600;color:var(--text)">'+nextTool.title+'</div>';
    h+='<div style="font-size:11px;color:var(--text3);margin-top:2px">'+nextTool.why+'</div></div></div></div>';
  }
  h+='</div>';
  return h;
}
`;

js = js.replace(
  "var HW_PHYSICIAN_COUNT='250+';",
  "var HW_PHYSICIAN_COUNT='250+';\n" + pathwayFn
);

console.log('Added hwPathway() function');
fs.writeFileSync('/home/ubuntu/.openclaw/workspace/heartwise/src/js-app.js', js, 'utf8');
console.log('Saved');
