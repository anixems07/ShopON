// Theme Toggle Logic
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

// Initial Load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    if (icon) {
        icon.classList.replace('fa-moon', 'fa-sun');
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const isDark = body.classList.contains('dark-theme');
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (icon) {
            if (isDark) {
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
            }
        }
    });
}
