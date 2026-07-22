// ── PRELOADER ──
(function(){
  const c = document.getElementById('pl-bg');
  if (!c) return;
  const ctx = c.getContext('2d');

  function drawBg() {
    c.width  = window.innerWidth  * devicePixelRatio;
    c.height = window.innerHeight * devicePixelRatio;
    c.style.width  = window.innerWidth  + 'px';
    c.style.height = window.innerHeight + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const W = window.innerWidth, H = window.innerHeight;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2;
    const R  = Math.min(W,H) * 0.44;
    const n  = 8;
    for (let i=0;i<n;i++){
      const a=(i/n)*Math.PI*2;
      for (let j=0;j<n;j++){
        const b=((i+j)/n)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a)*R, cy+Math.sin(a)*R);
        ctx.lineTo(cx+Math.cos(b)*R, cy+Math.sin(b)*R);
        ctx.strokeStyle='rgba(201,168,76,0.09)';
        ctx.lineWidth=0.5;
        ctx.stroke();
      }
    }
    for (let k=0;k<3;k++){
      const rr=R*(0.28+k*0.3);
      ctx.beginPath();
      for (let i=0;i<=12;i++){
        const a=(i/12)*Math.PI*2+k*0.26;
        const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle='rgba(201,168,76,0.06)';
      ctx.lineWidth=0.5;
      ctx.stroke();
    }
  }
  drawBg();
  window.addEventListener('resize', drawBg);

  // Rotate moon slowly
  const moonEl = document.getElementById('pl-moon');
  let ang = 0;
  let raf;
  function rotateMoon(){
    ang += 0.004;
    if (moonEl) {
      moonEl.setAttribute('transform',
        'translate(70,70) rotate(' + (ang * 180 / Math.PI) + ')');
    }
    raf = requestAnimationFrame(rotateMoon);
  }
  rotateMoon();

  // Fade out after 3.4s
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) {
        pl.classList.add('fade-out');
        setTimeout(() => {
          pl.style.display = 'none';
          cancelAnimationFrame(raf);
        }, 900);
      }
    }, 3400);
  });
})();
