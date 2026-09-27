(() => {
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const css = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const COLORS = () => ({
    text: css('--text', '#f2f7ff'),
    muted: css('--muted', '#8b98aa'),
    faint: css('--faint', '#526073'),
    line: css('--line', 'rgba(255,255,255,.1)'),
    cyan: css('--cyan', '#66ffe3'),
    blue: css('--blue', '#708cff'),
    violet: css('--violet', '#9b7cff'),
    bg: css('--bg', '#05070b'),
    panel: css('--panel-solid', '#0c121c')
  });

  function setupCanvas(canvas, height = 360) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = DPR();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.floor(height * dpr);
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return { ctx, resize, ro, width: () => canvas.getBoundingClientRect().width, height: () => height };
  }

  function drawGrid(ctx, w, h, pad = 28, step = 40) {
    const C = COLORS();
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    for (let x = pad; x <= w - pad; x += step) {
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, h - pad); ctx.stroke();
    }
    for (let y = pad; y <= h - pad; y += step) {
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function roundedLabel(ctx, x, y, text, fill, fg = '#03120e') {
    ctx.save();
    ctx.font = '10px DM Mono, monospace';
    const m = ctx.measureText(text);
    const ww = m.width + 14, hh = 22;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y - hh + 4, ww, hh, 4);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(text, x + 7, y - 4);
    ctx.restore();
  }

  // ------------------------------------------------------------
  // 1) Linear regression — draggable least squares
  // ------------------------------------------------------------
  const regCanvas = $('linregCanvas');
  if (regCanvas) {
    const S = setupCanvas(regCanvas, 390);
    const base = [
      [.08,.22],[.15,.31],[.23,.28],[.30,.43],[.38,.46],[.47,.52],
      [.55,.61],[.63,.60],[.72,.75],[.82,.79],[.91,.88]
    ];
    let pts = base.map(p => ({x:p[0], y:p[1]}));
    let drag = -1;
    const pad = 40;

    function fit() {
      const n = pts.length;
      const mx = pts.reduce((a,p)=>a+p.x,0)/n;
      const my = pts.reduce((a,p)=>a+p.y,0)/n;
      let num=0, den=0;
      pts.forEach(p => { num += (p.x-mx)*(p.y-my); den += (p.x-mx)*(p.x-mx); });
      const m = den ? num/den : 0;
      const b = my - m*mx;
      let sse=0, sst=0;
      pts.forEach(p => { const yh=m*p.x+b; sse+=(p.y-yh)**2; sst+=(p.y-my)**2; });
      return {m,b,mse:sse/n,r2:sst ? 1-sse/sst : 1};
    }

    function xy(p,w,h) { return [pad+p.x*(w-2*pad), h-pad-p.y*(h-2*pad)]; }
    function inv(px,py,w,h) { return {x:(px-pad)/(w-2*pad), y:(h-pad-py)/(h-2*pad)}; }

    function render() {
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS();
      drawGrid(ctx,w,h,pad,44);
      const F=fit();

      ctx.save();
      ctx.strokeStyle=C.blue; ctx.globalAlpha=.35; ctx.setLineDash([4,5]);
      pts.forEach(p=>{
        const [x,y]=xy(p,w,h); const [,yl]=xy({x:p.x,y:F.m*p.x+F.b},w,h);
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,yl);ctx.stroke();
      });
      ctx.restore();

      const a={x:0,y:F.b}, z={x:1,y:F.m+F.b};
      const [ax,ay]=xy(a,w,h),[zx,zy]=xy(z,w,h);
      ctx.save(); ctx.strokeStyle=C.cyan;ctx.lineWidth=2.4;ctx.shadowColor=C.cyan;ctx.shadowBlur=14;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(zx,zy);ctx.stroke();ctx.restore();

      pts.forEach((p,i)=>{
        const [x,y]=xy(p,w,h);
        ctx.beginPath();ctx.fillStyle=i===drag?C.cyan:C.text;ctx.arc(x,y,i===drag?7:5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle=C.bg;ctx.lineWidth=2;ctx.stroke();
      });

      roundedLabel(ctx,pad+4,30,'DRAG THE POINTS',C.cyan);
      $('linM').textContent=F.m.toFixed(3); $('linB').textContent=F.b.toFixed(3);
      $('linMse').textContent=F.mse.toFixed(4); $('linR2').textContent=F.r2.toFixed(3);
      $('linEquation').textContent='ŷ = '+F.b.toFixed(2)+' + '+F.m.toFixed(2)+'x';
    }

    function pointer(e) {
      const r=regCanvas.getBoundingClientRect();
      return {x:(e.clientX-r.left),y:(e.clientY-r.top),w:r.width,h:390};
    }
    regCanvas.addEventListener('pointerdown',e=>{
      const q=pointer(e); let best=-1,bd=18;
      pts.forEach((p,i)=>{ const [x,y]=xy(p,q.w,q.h); const d=Math.hypot(x-q.x,y-q.y); if(d<bd){bd=d;best=i;} });
      drag=best; if(drag>=0) regCanvas.setPointerCapture(e.pointerId); render();
    });
    regCanvas.addEventListener('pointermove',e=>{
      if(drag<0)return; const q=pointer(e),p=inv(q.x,q.y,q.w,q.h);
      pts[drag].x=Math.max(0,Math.min(1,p.x));pts[drag].y=Math.max(0,Math.min(1,p.y));render();
    });
    const release=()=>{drag=-1;render();};
    regCanvas.addEventListener('pointerup',release);regCanvas.addEventListener('pointercancel',release);
    $('linReset')?.addEventListener('click',()=>{pts=base.map(p=>({x:p[0],y:p[1]}));render();});
    $('linNoise')?.addEventListener('click',()=>{pts.forEach(p=>p.y=Math.max(.03,Math.min(.97,p.y+(Math.random()-.5)*.18)));render();});
    setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 2) Gradient descent — optimize slope/intercept live
  // ------------------------------------------------------------
  const gdCanvas = $('gdCanvas');
  if (gdCanvas) {
    const S=setupCanvas(gdCanvas,360),pad=40;
    const data=[[.07,.17],[.18,.26],[.31,.36],[.44,.52],[.58,.59],[.72,.76],[.86,.82],[.94,.92]].map(([x,y])=>({x,y}));
    let m=-.7,b=.8,iter=0,running=false,raf=0;
    const loss=()=>data.reduce((a,p)=>a+(m*p.x+b-p.y)**2,0)/data.length;
    function grad(){let gm=0,gb=0;for(const p of data){const e=m*p.x+b-p.y;gm+=2*e*p.x;gb+=2*e;}return [gm/data.length,gb/data.length];}
    function step(){const lr=parseFloat($('gdLr').value);const[g1,g2]=grad();m-=lr*g1;b-=lr*g2;iter++;}
    function xy(p,w,h){return[pad+p.x*(w-2*pad),h-pad-p.y*(h-2*pad)];}
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS();drawGrid(ctx,w,h,pad,44);
      data.forEach(p=>{const[x,y]=xy(p,w,h);ctx.beginPath();ctx.fillStyle=C.text;ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();});
      const [x0,y0]=xy({x:0,y:b},w,h),[x1,y1]=xy({x:1,y:m+b},w,h);
      ctx.save();ctx.strokeStyle=C.cyan;ctx.lineWidth=2.5;ctx.shadowColor=C.cyan;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore();
      roundedLabel(ctx,pad+4,30,'ITER '+iter,C.blue,'#fff');
      $('gdSlope').textContent=m.toFixed(3);$('gdIntercept').textContent=b.toFixed(3);$('gdLoss').textContent=loss().toFixed(5);$('gdIter').textContent=iter;
      $('gdLrValue').textContent=parseFloat($('gdLr').value).toFixed(3);
    }
    function loop(){if(!running)return;for(let i=0;i<3;i++)step();render();if(iter>2500||loss()<1e-5){running=false;$('gdRun').textContent='RUN';return;}raf=requestAnimationFrame(loop);}
    $('gdStep')?.addEventListener('click',()=>{step();render();});
    $('gdRun')?.addEventListener('click',()=>{running=!running;$('gdRun').textContent=running?'PAUSE':'RUN';if(running)loop();else cancelAnimationFrame(raf);});
    $('gdReset')?.addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);m=-.7;b=.8;iter=0;$('gdRun').textContent='RUN';render();});
    $('gdLr')?.addEventListener('input',render);setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 3) Logistic regression — threshold + confusion matrix
  // ------------------------------------------------------------
  const logCanvas=$('logCanvas');
  if(logCanvas){
    const S=setupCanvas(logCanvas,370),pad=36;
    const points=[
      [.10,.15,0],[.16,.28,0],[.25,.18,0],[.30,.40,0],[.38,.31,0],[.42,.49,0],
      [.48,.42,0],[.53,.58,1],[.59,.50,1],[.62,.67,1],[.70,.58,1],[.74,.78,1],
      [.82,.69,1],[.88,.84,1],[.93,.76,1]
    ].map(([x,y,c])=>({x,y,c}));
    const sigmoid=z=>1/(1+Math.exp(-z));
    const score=p=>sigmoid(7.4*p.x+6.1*p.y-6.6);
    function xy(p,w,h){return[pad+p.x*(w-2*pad),h-pad-p.y*(h-2*pad)];}
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS();drawGrid(ctx,w,h,pad,44);
      const th=parseFloat($('logThreshold').value);$('logThresholdValue').textContent=th.toFixed(2);
      const cols=42,rows=24,cw=(w-2*pad)/cols,ch=(h-2*pad)/rows;
      ctx.save();
      for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
        const p={x:(ix+.5)/cols,y:1-(iy+.5)/rows};const s=score(p);const pred=s>=th;
        ctx.globalAlpha=.035+Math.abs(s-th)*.055;ctx.fillStyle=pred?C.cyan:C.blue;ctx.fillRect(pad+ix*cw,pad+iy*ch,cw+1,ch+1);
      }
      ctx.restore();
      let tp=0,tn=0,fp=0,fn=0;
      points.forEach(p=>{
        const s=score(p),pred=s>=th; if(p.c&&pred)tp++;else if(!p.c&&!pred)tn++;else if(!p.c&&pred)fp++;else fn++;
        const[x,y]=xy(p,w,h);ctx.beginPath();ctx.fillStyle=p.c?C.cyan:C.blue;ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.lineWidth=pred===Boolean(p.c)?1:3;ctx.strokeStyle=pred===Boolean(p.c)?C.text:'#ff6b8a';ctx.stroke();
      });
      const z=Math.log(th/(1-th));
      const yFor=x=>(z+6.6-7.4*x)/6.1;
      const p0={x:0,y:yFor(0)},p1={x:1,y:yFor(1)};const[a,b]=xy(p0,w,h),[c,d]=xy(p1,w,h);
      ctx.save();ctx.strokeStyle=C.text;ctx.setLineDash([7,7]);ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();ctx.restore();
      $('cmTP').textContent=tp;$('cmTN').textContent=tn;$('cmFP').textContent=fp;$('cmFN').textContent=fn;
      const precision=tp/(tp+fp||1),recall=tp/(tp+fn||1);$('logPrecision').textContent=precision.toFixed(2);$('logRecall').textContent=recall.toFixed(2);
      roundedLabel(ctx,pad+4,29,'THRESHOLD '+th.toFixed(2),C.cyan);
    }
    $('logThreshold')?.addEventListener('input',render);setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 4) k-NN — mouse as query point
  // ------------------------------------------------------------
  const knnCanvas=$('knnCanvas');
  if(knnCanvas){
    const S=setupCanvas(knnCanvas,370),pad=36;
    const pts=[
      [.14,.22,0],[.18,.42,0],[.27,.31,0],[.31,.56,0],[.38,.43,0],[.24,.68,0],[.46,.25,0],
      [.58,.37,1],[.63,.57,1],[.69,.44,1],[.74,.70,1],[.81,.54,1],[.84,.78,1],[.91,.63,1],[.66,.82,1]
    ].map(([x,y,c])=>({x,y,c}));
    let q={x:.5,y:.5};
    const xy=(p,w,h)=>[pad+p.x*(w-2*pad),h-pad-p.y*(h-2*pad)];
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS(),k=parseInt($('knnK').value,10);$('knnKValue').textContent=k;
      drawGrid(ctx,w,h,pad,44);
      const sorted=pts.map((p,i)=>({p,i,d:Math.hypot(p.x-q.x,p.y-q.y)})).sort((a,b)=>a.d-b.d);const near=sorted.slice(0,k);const votes=near.reduce((a,n)=>a+n.p.c,0);const pred=votes>=k/2?1:0;
      const[qx,qy]=xy(q,w,h);
      ctx.save();ctx.strokeStyle=C.text;ctx.globalAlpha=.18;ctx.setLineDash([3,5]);near.forEach(n=>{const[x,y]=xy(n.p,w,h);ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(x,y);ctx.stroke();});ctx.restore();
      pts.forEach(p=>{const[x,y]=xy(p,w,h);ctx.beginPath();ctx.fillStyle=p.c?C.cyan:C.blue;ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();});
      ctx.beginPath();ctx.fillStyle=pred?C.cyan:C.blue;ctx.arc(qx,qy,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=C.text;ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.strokeStyle=C.text;ctx.globalAlpha=.45;ctx.arc(qx,qy,18,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      $('knnPred').textContent=pred?'CYAN CLASS':'BLUE CLASS';$('knnVotes').textContent=votes+' / '+k+' cyan votes';
      roundedLabel(ctx,pad+4,29,'MOVE YOUR CURSOR',pred?C.cyan:C.blue,pred?'#03120e':'#fff');
    }
    knnCanvas.addEventListener('pointermove',e=>{const r=knnCanvas.getBoundingClientRect();q.x=Math.max(0,Math.min(1,(e.clientX-r.left-pad)/(r.width-2*pad)));q.y=Math.max(0,Math.min(1,(370-pad-(e.clientY-r.top))/(370-2*pad)));render();});
    $('knnK')?.addEventListener('input',render);setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 5) Decision tree — tiny CART implementation + partitions
  // ------------------------------------------------------------
  const treeCanvas=$('treeCanvas');
  if(treeCanvas){
    const S=setupCanvas(treeCanvas,390),pad=34;
    let pts=[];
    function regenerate(){
      pts=[];
      for(let i=0;i<55;i++){
        const x=Math.random(),y=Math.random();
        const boundary=(x>.55&&y>.32)||(x<.38&&y>.68)||(x>.72&&y>.15);
        const c=(boundary?1:0)^(Math.random()<.08?1:0);pts.push({x,y,c});
      }
    }
    regenerate();
    const gini=arr=>{if(!arr.length)return 0;const p=arr.reduce((a,p)=>a+p.c,0)/arr.length;return 1-p*p-(1-p)*(1-p);};
    function build(arr,depth,maxDepth,bounds){
      const ones=arr.reduce((a,p)=>a+p.c,0);const pred=ones>=arr.length/2?1:0;
      if(depth>=maxDepth||arr.length<5||ones===0||ones===arr.length)return{leaf:true,pred,bounds};
      let best=null;
      for(const axis of ['x','y']){
        const vals=[...arr].sort((a,b)=>a[axis]-b[axis]);
        for(let i=2;i<vals.length-2;i++){
          const t=(vals[i-1][axis]+vals[i][axis])/2;
          const L=arr.filter(p=>p[axis]<t),R=arr.filter(p=>p[axis]>=t);
          const loss=(L.length*gini(L)+R.length*gini(R))/arr.length;
          if(!best||loss<best.loss)best={axis,t,L,R,loss};
        }
      }
      if(!best)return{leaf:true,pred,bounds};
      const lb={...bounds},rb={...bounds};lb[best.axis+'1']=best.t;rb[best.axis+'0']=best.t;
      return{leaf:false,pred,axis:best.axis,t:best.t,bounds,left:build(best.L,depth+1,maxDepth,lb),right:build(best.R,depth+1,maxDepth,rb)};
    }
    function leaves(n,out=[]){if(n.leaf)out.push(n);else{leaves(n.left,out);leaves(n.right,out);}return out;}
    function lines(n,out=[]){if(!n.leaf){out.push(n);lines(n.left,out);lines(n.right,out);}return out;}
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS(),depth=parseInt($('treeDepth').value,10);$('treeDepthValue').textContent=depth;drawGrid(ctx,w,h,pad,44);
      const tree=build(pts,0,depth,{x0:0,x1:1,y0:0,y1:1});
      ctx.save();
      leaves(tree).forEach(l=>{const b=l.bounds;const x=pad+b.x0*(w-2*pad),yy=pad+(1-b.y1)*(h-2*pad),ww=(b.x1-b.x0)*(w-2*pad),hh=(b.y1-b.y0)*(h-2*pad);ctx.fillStyle=l.pred?C.cyan:C.blue;ctx.globalAlpha=.08;ctx.fillRect(x,yy,ww,hh);});
      ctx.restore();
      ctx.save();ctx.strokeStyle=C.text;ctx.globalAlpha=.48;ctx.setLineDash([5,4]);
      lines(tree).forEach(n=>{const b=n.bounds;if(n.axis==='x'){const x=pad+n.t*(w-2*pad);const y0=pad+(1-b.y1)*(h-2*pad),y1=pad+(1-b.y0)*(h-2*pad);ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.stroke();}else{const y=pad+(1-n.t)*(h-2*pad);const x0=pad+b.x0*(w-2*pad),x1=pad+b.x1*(w-2*pad);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();}});ctx.restore();
      pts.forEach(p=>{const x=pad+p.x*(w-2*pad),y=pad+(1-p.y)*(h-2*pad);ctx.beginPath();ctx.fillStyle=p.c?C.cyan:C.blue;ctx.arc(x,y,4.5,0,Math.PI*2);ctx.fill();});
      let correct=0;function predict(n,p){if(n.leaf)return n.pred;return predict((p[n.axis]<n.t)?n.left:n.right,p);}pts.forEach(p=>correct+=predict(tree,p)===p.c?1:0);
      $('treeLeaves').textContent=leaves(tree).length;$('treeAcc').textContent=(correct/pts.length*100).toFixed(1)+'%';roundedLabel(ctx,pad+4,29,'MAX DEPTH '+depth,C.cyan);
    }
    $('treeDepth')?.addEventListener('input',render);$('treeRegenerate')?.addEventListener('click',()=>{regenerate();render();});setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 6) Feature map — XOR before/after hand-crafted representation
  // ------------------------------------------------------------
  const featCanvas=$('featureCanvas');
  if(featCanvas){
    const S=setupCanvas(featCanvas,350),pad=34;
    const pts=[];const centers=[[-.65,-.65,0],[-.65,.65,1],[.65,-.65,1],[.65,.65,0]];
    centers.forEach(([cx,cy,c])=>{for(let i=0;i<13;i++)pts.push({x:cx+(Math.random()-.5)*.34,y:cy+(Math.random()-.5)*.34,c});});
    let transformed=false;
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS();ctx.clearRect(0,0,w,h);
      const mid=w/2;ctx.strokeStyle=C.line;ctx.beginPath();ctx.moveTo(mid,20);ctx.lineTo(mid,h-20);ctx.stroke();
      function panel(x0,x1,label,mode){
        const pw=x1-x0;ctx.fillStyle=C.muted;ctx.font='10px DM Mono, monospace';ctx.fillText(label,x0+16,25);
        ctx.strokeStyle=C.line;ctx.strokeRect(x0+18,45,pw-36,h-75);
        const map=p=> mode==='raw'?[(p.x+1)/2,(p.y+1)/2]:[(p.x+1)/2,((p.x*p.y)+1)/2];
        pts.forEach(p=>{const q=map(p);const x=x0+18+q[0]*(pw-36),y=45+(1-q[1])*(h-75);ctx.beginPath();ctx.fillStyle=p.c?C.cyan:C.blue;ctx.arc(x,y,4.4,0,Math.PI*2);ctx.fill();});
        if(mode==='mapped'){
          const y=45+(1-.5)*(h-75);ctx.strokeStyle=C.text;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(x0+18,y);ctx.lineTo(x1-18,y);ctx.stroke();ctx.setLineDash([]);
        }
      }
      panel(0,mid,'RAW SPACE  (x₁, x₂)','raw');panel(mid,w,'FEATURE SPACE  (x₁, x₁×x₂)',transformed?'mapped':'raw');
      $('featureState').textContent=transformed?'FEATURE MAP ACTIVE':'RAW FEATURES';
      $('featureToggle').textContent=transformed?'REMOVE FEATURE MAP':'APPLY x₁ × x₂ FEATURE';
    }
    $('featureToggle')?.addEventListener('click',()=>{transformed=!transformed;render();});setTimeout(render,50);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // 7) Neural network — actual browser-side XOR training
  // ------------------------------------------------------------
  const nnCanvas=$('nnCanvas');
  if(nnCanvas){
    const S=setupCanvas(nnCanvas,430),pad=34;
    let net=null,data=[],epoch=0,running=false,raf=0,lossVal=0;
    const tanh=Math.tanh;
    const sig=z=>1/(1+Math.exp(-Math.max(-30,Math.min(30,z))));
    const rand=()=> (Math.random()*2-1)*.9;
    function initNet(){
      net={W1:Array.from({length:6},()=>[rand(),rand()]),b1:Array.from({length:6},rand),W2:Array.from({length:6},rand),b2:rand()};
      epoch=0;lossVal=0;running=false;cancelAnimationFrame(raf);$('nnTrain').textContent='TRAIN';
      data=[];const centers=[[-.65,-.65,0],[-.65,.65,1],[.65,-.65,1],[.65,.65,0]];
      centers.forEach(([cx,cy,c])=>{for(let i=0;i<42;i++)data.push({x:cx+(Math.random()-.5)*.42,y:cy+(Math.random()-.5)*.42,c});});
    }
    function forward(p){
      const h=net.W1.map((w,j)=>tanh(w[0]*p.x+w[1]*p.y+net.b1[j]));let z=net.b2;for(let j=0;j<6;j++)z+=net.W2[j]*h[j];return{h,o:sig(z)};
    }
    function trainStep(){
      const lr=parseFloat($('nnLr').value);let dW1=Array.from({length:6},()=>[0,0]),db1=Array(6).fill(0),dW2=Array(6).fill(0),db2=0,loss=0;
      for(const p of data){
        const {h,o}=forward(p);const y=p.c;loss+=-(y*Math.log(o+1e-8)+(1-y)*Math.log(1-o+1e-8));const dz=o-y;
        for(let j=0;j<6;j++){dW2[j]+=dz*h[j];const dh=dz*net.W2[j]*(1-h[j]*h[j]);dW1[j][0]+=dh*p.x;dW1[j][1]+=dh*p.y;db1[j]+=dh;}db2+=dz;
      }
      const n=data.length;
      for(let j=0;j<6;j++){net.W1[j][0]-=lr*dW1[j][0]/n;net.W1[j][1]-=lr*dW1[j][1]/n;net.b1[j]-=lr*db1[j]/n;net.W2[j]-=lr*dW2[j]/n;}net.b2-=lr*db2/n;lossVal=loss/n;epoch++;
    }
    function render(){
      const ctx=S.ctx,w=S.width(),h=S.height(),C=COLORS();ctx.clearRect(0,0,w,h);
      const fieldTop=42,fieldH=h-fieldTop-pad,fieldL=pad,fieldW=w-2*pad;const cols=Math.max(36,Math.floor(w/12)),rows=32,cw=fieldW/cols,ch=fieldH/rows;
      for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
        const x=-1+2*(ix+.5)/cols,y=1-2*(iy+.5)/rows,o=forward({x,y}).o;ctx.globalAlpha=.05+.18*Math.abs(o-.5)*2;ctx.fillStyle=o>.5?C.cyan:C.blue;ctx.fillRect(fieldL+ix*cw,fieldTop+iy*ch,cw+1,ch+1);
      }
      ctx.globalAlpha=1;ctx.strokeStyle=C.line;ctx.strokeRect(fieldL,fieldTop,fieldW,fieldH);
      data.forEach(p=>{const x=fieldL+(p.x+1)/2*fieldW,y=fieldTop+(1-(p.y+1)/2)*fieldH;ctx.beginPath();ctx.fillStyle=p.c?C.cyan:C.blue;ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();});
      ctx.fillStyle=C.muted;ctx.font='10px DM Mono, monospace';ctx.fillText('LEARNED DECISION FIELD',pad,24);
      let correct=0;data.forEach(p=>correct+=(forward(p).o>=.5)===Boolean(p.c)?1:0);$('nnEpoch').textContent=epoch;$('nnLoss').textContent=lossVal?lossVal.toFixed(4):'—';$('nnAcc').textContent=(correct/data.length*100).toFixed(1)+'%';$('nnLrValue').textContent=parseFloat($('nnLr').value).toFixed(2);
    }
    function loop(){if(!running)return;for(let i=0;i<14;i++)trainStep();render();if(epoch>5000||lossVal<.025){running=false;$('nnTrain').textContent='TRAIN';return;}raf=requestAnimationFrame(loop);}
    initNet();
    $('nnTrain')?.addEventListener('click',()=>{running=!running;$('nnTrain').textContent=running?'PAUSE':'TRAIN';if(running)loop();else cancelAnimationFrame(raf);});
    $('nnStep')?.addEventListener('click',()=>{for(let i=0;i<20;i++)trainStep();render();});
    $('nnReset')?.addEventListener('click',()=>{initNet();render();});$('nnLr')?.addEventListener('input',render);setTimeout(render,60);addEventListener('resize',()=>requestAnimationFrame(render));
  }

  // ------------------------------------------------------------
  // Neural network diagram: moving activation pulse
  // ------------------------------------------------------------
  const diagram=$('networkDiagram');
  if(diagram){
    const ctx=diagram.getContext('2d');
    let t=0;
    function resize(){const r=diagram.getBoundingClientRect(),d=DPR();diagram.width=r.width*d;diagram.height=260*d;diagram.style.height='260px';ctx.setTransform(d,0,0,d,0,0);}
    resize();new ResizeObserver(resize).observe(diagram);
    function renderDiagram(){
      const w=diagram.getBoundingClientRect().width,h=260,C=COLORS();ctx.clearRect(0,0,w,h);
      const layers=[[.12,[.36,.64]],[.42,[.20,.37,.53,.70,.84]],[.72,[.28,.5,.72]],[.90,[.5]]];
      const nodes=layers.map(([x,ys])=>ys.map(y=>({x:x*w,y:y*h})));
      for(let l=0;l<nodes.length-1;l++)for(let i=0;i<nodes[l].length;i++)for(let j=0;j<nodes[l+1].length;j++){
        const a=nodes[l][i],b=nodes[l+1][j];ctx.strokeStyle=C.line;ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        const phase=(t*.18+l*.25+i*.07+j*.03)%1;const x=a.x+(b.x-a.x)*phase,y=a.y+(b.y-a.y)*phase;ctx.fillStyle=(l+j)%2?C.cyan:C.blue;ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;nodes.forEach((layer,l)=>layer.forEach(n=>{ctx.beginPath();ctx.fillStyle=C.panel;ctx.strokeStyle=l===nodes.length-1?C.cyan:C.text;ctx.lineWidth=1.4;ctx.arc(n.x,n.y,9,0,Math.PI*2);ctx.fill();ctx.stroke();}));
      ctx.fillStyle=C.faint;ctx.font='9px DM Mono, monospace';['INPUT','HIDDEN 1','HIDDEN 2','OUTPUT'].forEach((s,i)=>ctx.fillText(s,layers[i][0]*w-24,20));
      t++;requestAnimationFrame(renderDiagram);
    }renderDiagram();
  }

  const railItems=[...document.querySelectorAll('[data-ml-step]')];
  if(railItems.length){
    const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.mlj-rail a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}});},{rootMargin:'-40% 0px -50% 0px',threshold:0});
    railItems.forEach(s=>obs.observe(s));
  }
})();
