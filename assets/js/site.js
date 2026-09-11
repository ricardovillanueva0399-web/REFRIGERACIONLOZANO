(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n, decimals){
    return n.toLocaleString('es-MX', {minimumFractionDigits:decimals, maximumFractionDigits:decimals});
  }

  function animateCount(el){
    var target = parseFloat(el.dataset.count);
    if(isNaN(target)) return;
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if(reduced){ el.textContent = prefix + fmt(target, decimals) + suffix; return; }
    var dur = 900, start = null;
    function tick(ts){
      if(start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased, decimals) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function revealBar(el){
    var w = el.dataset.w;
    if(!w) return;
    if(reduced){ el.style.width = w; return; }
    el.style.width = '0';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.style.width = w; }); });
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var el = entry.target;
      if(el.hasAttribute('data-count')) animateCount(el);
      if(el.classList.contains('fill')) revealBar(el);
      io.unobserve(el);
    });
  }, {threshold:.35});

  document.querySelectorAll('[data-count]').forEach(function(el){ io.observe(el); });
  document.querySelectorAll('.fill[data-w]').forEach(function(el){ io.observe(el); });

  document.querySelectorAll('.segmented').forEach(function(group){
    var name = group.dataset.group;
    var buttons = group.querySelectorAll('button');
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        buttons.forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        document.querySelectorAll('[data-panel="' + name + '"]').forEach(function(p){
          p.hidden = p.dataset.value !== btn.dataset.value;
        });
        var shown = document.querySelector('[data-panel="' + name + '"][data-value="' + btn.dataset.value + '"]');
        if(shown){
          shown.querySelectorAll('[data-count]').forEach(function(el){ animateCount(el); });
          shown.querySelectorAll('.fill[data-w]').forEach(function(el){ revealBar(el); });
        }
      });
    });
  });

  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.tabbar a');
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        navLinks.forEach(function(l){
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, {rootMargin:'-35% 0px -55% 0px'});
  sections.forEach(function(s){ spy.observe(s); });
})();
