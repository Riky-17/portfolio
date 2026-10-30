window.addEventListener("load", () =>
{
    const body = document.body;
    const html = document.documentElement;

    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("reveal-canvas");


    canvas.width = Math.max(
        body.scrollWidth, body.offsetWidth, 
        html.clientWidth, html.scrollWidth, html.offsetWidth
    );

    canvas.height = Math.max(
        body.scrollHeight, body.offsetHeight, 
        html.clientHeight, html.scrollHeight, html.offsetHeight
    );

    let ctx = canvas.getContext("2d");
    
    let width = canvas.width;
    let height = canvas.height;
    let lastX = null;
    let lastY = null;
    let lastTime = null;
    
    const SPEED_THRESHOLD = 0.8;
    const MIN_RIPPLE_INTERVAL = 1000;
    const RIPPLE_RADIUS = 20;
    const RIPPLE_BORDER_RADIUS = 2; 
    let lastRippleTime = 0;
    
    const ripples = [];

    document.addEventListener("mousemove", (event) =>
    {
        const now = performance.now();
        const x = event.pageX;
        const y = event.pageY;

        if(lastX !== null && lastTime !== null)
        {
            const dx = x - lastX;
            const dy = y - lastY;
            const dt = now - lastTime;

            if(dt > 0)
            {
                const distance = Math.sqrt(dx * dx + dy * dy);
                const speed = distance / dt;

                if(speed > SPEED_THRESHOLD && now - lastRippleTime > MIN_RIPPLE_INTERVAL)
                {
                    ripples.push(
                    {
                        x,
                        y,
                        radius: RIPPLE_RADIUS,
                        alpha: 0.8,
                        born: now
                    });

                    // createRipple(x, y);
                    lastRippleTime = now;
                }
            }
        }

        lastX = x;
        lastY = y;
        lastTime = now;
    });

    function animate(now)
    {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        for (let i = ripples.length - 1; i >= 0; i--) 
        {
            const r = ripples[i];
            const age = now - r.born;
            console.log(age);
            
            r.radius = RIPPLE_RADIUS + age * 0.18;
            r.alpha = 0.8 * Math.max(0, 1 - age / 1200);

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
            // gradient.addColorStop(0.95, "rgba(255,255,255,0)");
            // gradient.addColorStop(0.95, "rgba(255,255,255,1)");
            // gradient.addColorStop(1, "rgba(255,255,255,1)");
            
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.fill();
            
            const borderGradient = ctx.createRadialGradient(
                r.x, r.y, r.radius,
                r.x, r.y, r.radius + RIPPLE_BORDER_RADIUS
            );
            
            borderGradient.addColorStop(0, "rgba(255,255,255,0)");
            borderGradient.addColorStop(0.5, "rgba(255,255,255,0)");
            borderGradient.addColorStop(0.5, "rgba(255,255,255,1)");
            borderGradient.addColorStop(1, "rgba(255,255,255,1)");

            // borderGradient.addColorStop(0, "rgba(255,255,255,0)");
            // borderGradient.addColorStop(0.4, "rgba(255,255,255,0.8)");
            // borderGradient.addColorStop(1, "rgba(255,255,255,0)");

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

    
    // function test()
    // {
    //     ctx.fillStyle = "black";
    //     ctx.fillRect(0, 0, width, height);
    //     const gradient = ctx.createRadialGradient(
    //         47, 45, 0,
    //         47, 45, 40
    //     );
        
    //     gradient.addColorStop(0, `rgba(255,255,255,0.8)`);
    //     gradient.addColorStop(0.55, `rgba(255,255,255,0.5)`);
    //     gradient.addColorStop(1, "rgba(255,255,255,0)");

    //     ctx.globalCompositeOperation = "destination-out";

    //     ctx.fillStyle = gradient;
    //     ctx.beginPath();
    //     ctx.arc(47, 45, 40, 0, Math.PI * 2);
    //     ctx.fill();

    //     ctx.globalCompositeOperation = "source-over";
    // }

    // test();
});

// function canvasSize()
// {
//     canvas.width = canvas.scrollWidth;
//     canvas.height = Math.max(
//         document.body.scrollHeight, document.body.offsetHeight, 
//         document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight
//     );
//     // ctx = canvas.getContext("2d");
//     console.log(canvas.height);
// }

// window.addEventListener("load", canvasSize);

// function resizeCanvas()
// {
//     const dpr = Math.min(window.devicePixelRatio || 1, 2);

//     width = window.innerWidth;
//     height = window.innerHeight;

//     canvas.width = width * dpr;
//     canvas.height = height * dpr;

//     ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
// }

// window.addEventListener("resize", resizeCanvas);
// resizeCanvas();

// requestAnimationFrame(animate);


function createRipple(x, y)
{
    const ripple = document.createElement("div");
    ripple.classList.add("ripple");

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    document.body.appendChild(ripple);

    ripple.addEventListener("animationend", () =>
    {
        ripple.remove();
    });
}