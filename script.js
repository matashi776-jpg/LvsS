// Current language
let cur = 'nl';

// Function to switch pages
function go(p) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    document.getElementById(p).classList.add('active');
    
    // Set active nav button
    const activeBtn = event.target;
    if (activeBtn && activeBtn.classList.contains('nav-btn')) {
        activeBtn.classList.add('active');
    }
    
    window.scrollTo(0,0);
    
    // Update header on scroll - только если мы не на главной странице
    const header = document.getElementById('main-header');
    if (p !== 'home') {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Function to switch language
function setL(l) {
    cur = l;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    
    // Update active language button
    const langBtn = document.querySelector(`[onclick="setL('${l}')"]`);
    if (langBtn) {
        langBtn.classList.add('active');
    }
    
    // Update all translated elements
    document.querySelectorAll('[data-t]').forEach(el => {
        const parts = el.getAttribute('data-t').split('.');
        const section = parts[0];
        const key = parts[1];
        
        if (L[l] && L[l][section] && L[l][section][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = L[l][section][key];
            } else {
                el.innerText = L[l][section][key];
            }
        }
    });
    
    // Update cat message
    document.getElementById('cat-msg').innerText = L[l].msg;
    
    // Re-render dynamic content
    render();
    
    // Update calculator
    upd();
}

// Calculator function
function upd() {
    const val = Number(document.getElementById('sType').value);
    const hrs = Number(document.getElementById('sHrs').value);
    const price = (val * hrs).toFixed(2).replace('.', ',');
    document.getElementById('res').innerText = price;
    
    // Update fact
    const facts = L[cur].cf;
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    document.getElementById('calcFact').innerText = randomFact;
}

// Render services, expertise, and gallery
function render() {
    // Services
    document.getElementById('s-list').innerHTML = L[cur].sv.map(x => `
        <div class="glass">
            <div style="width:100%; height:200px; background: var(--secondary); border-radius:15px; display: flex; align-items: center; justify-content: center; margin-bottom:15px;">
                <span style="font-size: 3rem;">${x.i}</span>
            </div>
            <h3>${x.t}</h3>
            <p style="margin-top:10px; color:#555;">${x.d}</p>
            <div style="font-weight:bold; margin-top:10px;">${x.p}</div>
        </div>
    `).join('');

    // Expertise
    document.getElementById('e-list').innerHTML = L[cur].ex.map(x => `
        <div class="glass" style="border-left: 6px solid var(--green);"><b>✨</b> ${x}</div>
    `).join('');
    
    // Gallery
    document.getElementById('g-list').innerHTML = L[cur].gal.map(img => `
        <div class="glass" style="padding:10px; text-align:center;">
            <div style="width:100%; height:200px; border-radius:15px; display: flex; align-items: center; justify-content: center; margin-bottom:10px; overflow: hidden;">
                <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
            </div>
        </div>
    `).join('');
}

// Create floating bubbles
function createBubble() {
    const b = document.createElement('div');
    b.className = 'bubble';
    const sz = Math.random() * 50 + 20 + 'px';
    b.style.width = sz; 
    b.style.height = sz;
    b.style.left = Math.random() * 100 + 'vw';
    b.style.top = '110vh';
    b.style.position = 'fixed';
    b.style.borderRadius = '50%';
    b.style.background = `hsl(${Math.random()*360}, 80%, 60%)`;
    b.style.opacity = 0.7;
    b.style.zIndex = 900;
    b.style.transition = 'top 8s linear, transform 0.2s, opacity 0.2s';
    
    b.onclick = () => { 
        b.style.transform = 'scale(1.5)'; 
        b.style.opacity = '0'; 
        setTimeout(()=>b.remove(), 200); 
    };
    
    document.body.appendChild(b);
    
    setTimeout(() => b.style.top = '-10vh', 100);
    setTimeout(() => b.remove(), 8000);
}

// Set initial calculator price
// upd(); - Убрано, так как при запуске функция сработает автоматически

// Start bubble creation
setInterval(createBubble, 300);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initial render of dynamic content
    render();
    
    // Add click handler to cat
    const cat = document.querySelector('.purr-cat');
    cat.addEventListener('click', () => {
        const msg = document.getElementById('cat-msg');
        msg.style.transform = 'scale(1.3)';
        setTimeout(() => { msg.style.transform = 'scale(1)'; }, 300);
    });
    
    // Handle scroll for header effect
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            const activeBtn = document.querySelector('.nav-btn.active');
            if (activeBtn) {
                const prevBtn = activeBtn.previousElementSibling;
                if (prevBtn && prevBtn.classList.contains('nav-btn')) {
                    prevBtn.click();
                }
            }
        } else if (e.key === 'ArrowRight') {
            const activeBtn = document.querySelector('.nav-btn.active');
            if (activeBtn) {
                const nextBtn = activeBtn.nextElementSibling;
                if (nextBtn && nextBtn.classList.contains('nav-btn')) {
                    nextBtn.click();
                }
            }
        }
    });
    
    // Initialize with NL language
    setL('nl');
});