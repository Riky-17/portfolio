const body = document.body;
const html = document.documentElement;

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("reveal-canvas");
let ctx = canvas.getContext("2d");

const ripples = [];

let lastX = null;
let lastY = null;
let lastTime = null;

let lastRippleTime = 0;

window.addEventListener("load", () =>
{
    resizeCanvas();
    let width = canvas.width;
    let height = canvas.height;
    const RIPPLE_BORDER_RADIUS = 2; 
    
    function easeIn(t, maxT = 1)
    {
        return t * t / (maxT * maxT);
    }

    function easeOut(t, maxT = 1)
    {
        return 1 - Math.pow(1 - t / maxT, 2);
    }

    document.addEventListener("mousemove", mouseRipple);
    document.addEventListener("touchmove", touchRipple, {passive: true});
    document.addEventListener("touchstart", touchRipple, {passive: true});

    function animate(now)
    {
        ctx.fillStyle = "rgb(14, 1, 55)";
        ctx.fillRect(0, 0, width, height);

        for (let i = ripples.length - 1; i >= 0; i--) 
        {
            const r = ripples[i];
            const age = Math.max(0, (now - r.born) / 1000);
            const rippleDuration = 3;
            
            r.radius = 200 * easeOut(age, rippleDuration);
            r.alpha = Math.max(0, 1 - easeIn(age, rippleDuration));

            if(r.alpha <= 0)
            {
                ripples.splice(i, 1);
                continue;
            }
            
            const gradient = ctx.createRadialGradient(
                r.x, r.y, r.radius * 0.15,
                r.x, r.y, r.radius
            );
            
            gradient.addColorStop(0, `rgba(255,255,255,${r.alpha})`);
            gradient.addColorStop(0.55, `rgba(255,255,255,${r.alpha * 0.5})`);
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.fill();
            
            const borderGradient = ctx.createRadialGradient(
                r.x, r.y, r.radius,
                r.x, r.y, r.radius + RIPPLE_BORDER_RADIUS
            );
            
            borderGradient.addColorStop(0, "rgba(255,255,255,0)");
            borderGradient.addColorStop(0.5, "rgba(255,255,255,0)");
            borderGradient.addColorStop(0.5, `rgba(255,255,255,${1 - easeOut(age, rippleDuration)})`);
            borderGradient.addColorStop(1, `rgba(255,255,255,${1 - easeOut(age, rippleDuration)})`);

            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = borderGradient;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius + RIPPLE_BORDER_RADIUS, 0, Math.PI * 2);
            ctx.fill();

        }

        ctx.globalCompositeOperation = "source-over";
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});

function touchRipple(event)
{
    const touch = event.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    createRipple(x, y, performance.now());
}

function mouseRipple(event)
{
    const SPEED_THRESHOLD = 0.8;
    const MIN_RIPPLE_INTERVAL = 1000;
    
    const now = performance.now();
    const x = event.pageX;
    const y = event.pageY;
    
    if(lastX !== null && lastTime !== null)
    {
        const dx = x - lastX;
        const dy = y - lastY;
        const dt =  now - lastTime;

        if(dt > 0)
        {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = distance / dt;

            if(speed > SPEED_THRESHOLD && now - lastRippleTime > MIN_RIPPLE_INTERVAL)
            {
                createRipple(x, y, now);
                lastRippleTime = now;
            }
        }
    }

    lastX = x;
    lastY = y;
    lastTime = now;
}

function createRipple(x, y, t)
{
    ripples.push(
    {
        x,
        y,
        radius: 20,
        alpha: 0.8,
        born: t
    });
}

window.addEventListener("resize", resizeCanvas);

function resizeCanvas()
{
    canvas.width = Math.max(
        body.scrollWidth, body.offsetWidth, 
        html.clientWidth, html.scrollWidth, html.offsetWidth
    );

    canvas.height = Math.max(
        body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight
    );
}