/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("water-bg");
const canvasParent = canvas.parentElement;
canvas.width = canvasParent.clientWidth;
canvas.height = canvasParent.clientHeight;
const gl = canvas.getContext("webgl2");

async function loadShader(url)
{
    const response = await fetch(url);

    if(!response.ok)
    {
        throw new Error(`Failed to load ${url}`);
    }

    return response.text();
}

function compileShader(gl, type, source)
{
    const shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
    }

    return shader;
}

function createProgram(gl, vertexSource, fragmentSource)
{
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        throw new Error(gl.getProgramInfoLog(program));
    }

    return program;
}

async function main() 
{
    const vertexSource = await loadShader(new URL("./waterBG.vert", import.meta.url));
    const fragmentSource = await loadShader(new URL("./waterBG.frag", import.meta.url));

    const program = createProgram(gl, vertexSource, fragmentSource);

    gl.useProgram(program);

    const vertices = new Float32Array([
        -1, -1,
        +1, -1,
        -1, +1,

        -1, +1,
        +1, -1,
        +1, +1
    ]);

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);

    function render(time)
    {
        const seconds = time * 0.001;

        gl.uniform1f(timeLocation, seconds);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main().catch(console.error);

