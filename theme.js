const themeButton = document.getElementById('theme-toggle');
function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';document.getElementById('theme-label').textContent=dark?'Light':'Dark';themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeButton.title=dark?'Switch to light mode':'Switch to dark mode';themeButton.querySelector('span').textContent=dark?'☀':'◐';}
updateThemeButton();
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('portfolio-theme',theme)}catch(e){}updateThemeButton()});
