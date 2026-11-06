const publications=[
{year:'2026',type:'published',title:'HierarchicalNets for Multi-Level Hierarchical Classification of Yoga Poses',authors:'M. Barot, P. Thakkar, V. Ukani, M. A. Mehta, K. Kotecha, A. Abraham, D. Kapil, L. Vanderbloemen',venue:'Scientific Reports',paper:'https://www.nature.com/articles/s41598-026-54558-1',code:'https://github.com/themnvrao76/HierarchicalNets'},
{year:'2026',type:'published',title:'PhyViT-GAN: Physics-Guided MobileViT-GAN for Precise Self-Alignment Image Generation',authors:'M. Barot, J. Kim, D. Won, S. W. Yoon',venue:'The International Journal of Advanced Manufacturing Technology',paper:'https://doi.org/10.1007/s00170-025-17227-7',code:'https://github.com/themnvrao76/PhyViT-GAN-Physics-Guided-MobileViT-GAN'},
{year:'Ongoing',type:'progress',title:'PoseVLM: Geometry-Conditioned Vision-Language Reasoning for Fine-Grained Pose Understanding',authors:'M. Barot, S. Kojaku',venue:'Manuscript in preparation'},
{year:'Ongoing',type:'progress',title:'PoseFix: Natural-Language Instructions for Human Pose Correction',authors:'M. Barot, P. Thakkar',venue:'Manuscript in preparation',code:'https://github.com/themnvrao76/FixMyPose-Project'},
{year:'Ongoing',type:'progress',title:'Fourier-Informed Attention Transformers: A Novel Approach to Electricity Price Forecasting in New Zealand’s Market',authors:'H. Mansy, M. Barot, P. Thakkar, S. W. Yoon, Y. Wang',venue:'Applied Energy · In final revision'},
{year:'Ongoing',type:'progress',title:'Glaucoma Detection Framework Using DeepLabV3+ Aided MobileViT-V2',authors:'H. Gajjar, M. Barot, et al.',venue:'Biomedical Signal Processing and Control · Under review'},
{year:'2025',type:'published',title:'Enhancing Assembly Quality through Parameter Optimization with an Energy Minimization Simulator and Machine Learning',authors:'J. Kim, A. Farrag, M. Barot, D. Won',venue:'FAIM 2025'},
{year:'2025',type:'published',title:'FloodNetFormer: A Dual-Stream Transformer for SAR-Based Flood Extent Mapping',authors:'V. K. Prasad, M. Barot',venue:'WETWAR 2025'},
{year:'2022',type:'published',title:'Analysis of Boosting Mechanisms in Cloud-Based Intrusion Detection Systems',authors:'M. Zuhair, P. Bhattacharya, V. K. Prasad, M. Barot, M. Modi',venue:'IC3I 2022'}];
function render(filter='all'){const selected=publications.filter(p=>filter==='all'||p.type===filter);document.querySelector('#publication-list').innerHTML=selected.map(p=>`<article class="publication"><span>${p.year}</span><div><h3>${p.title}</h3><p>${p.authors.replace('M. Barot','<strong>M. Barot</strong>')}</p><p class="venue">${p.venue}</p>${p.paper?`<a href="${p.paper}" target="_blank" rel="noopener">Paper ↗</a>`:''}${p.code?`<a href="${p.code}" target="_blank" rel="noopener">Code ↗</a>`:''}</div></article>`).join('');document.querySelector('#pub-count').textContent=`${selected.length} entries`}
render();document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(b.dataset.filter)}));
const dialog=document.querySelector('#figure-dialog');document.querySelectorAll('[data-figure]').forEach(b=>b.addEventListener('click',()=>{const img=document.querySelector('#expanded-figure');img.src=b.dataset.figure;img.alt=b.querySelector('img').alt;document.querySelector('#figure-title').textContent=b.dataset.title;dialog.showModal()}));document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
// Accessible organization tabs: mouse, touch, and keyboard navigation.
const experienceTabs = [...document.querySelectorAll('[data-experience]')];
function selectExperience(button, moveFocus = false) {
  experienceTabs.forEach(tab => {
    const active = tab === button;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (moveFocus) button.focus();
}
experienceTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectExperience(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % experienceTabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + experienceTabs.length - 1) % experienceTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = experienceTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectExperience(experienceTabs[next], true); }
  });
});
const mobileTabs = window.matchMedia('(max-width: 600px)');
function syncTabOrientation() { document.querySelector('.experience-tabs').setAttribute('aria-orientation', mobileTabs.matches ? 'horizontal' : 'vertical'); }
syncTabOrientation();
mobileTabs.addEventListener('change', syncTabOrientation);
const themeButton = document.getElementById('theme-toggle');
function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';document.getElementById('theme-label').textContent=dark?'Light':'Dark';themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeButton.title=dark?'Switch to light mode':'Switch to dark mode';themeButton.querySelector('span').textContent=dark?'☀':'◐';}
updateThemeButton();
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('portfolio-theme',theme)}catch(e){}updateThemeButton()});
