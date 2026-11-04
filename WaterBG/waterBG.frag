#version 300 es

precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

vec2 hash2D(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx + p3.yz) * p3.zy);
}

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(443.897, 441.423, 437.195));
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float hashAngle(vec2 p)
{
    return hash(p) * 6.28318530718;
}

float noise(vec2 p)
{
    vec2 cell = floor(p);
    vec2 local = fract(p);

    // local = local * local * (3.0 - 2.0 * local);

    float a = hash(cell);
    float b = hash(cell + vec2(1.0, 0.0));
    float c = hash(cell + vec2(0.0, 1.0));
    float d = hash(cell + vec2(1.0, 1.0));

    float t =  mix(mix(a, b, local.x), mix(c, d, local.x), local.y);

    // return 6.0 * t * t * t * t * t - 15.0 * t * t * t * t + 10.0 * t * t * t;
    return t;
}

float perlinNoise(vec2 p)
{
    vec2 l = fract(p);

    vec2 a = floor(p);
    vec2 b = a + vec2(1.0, 0.0);
    vec2 c = a + vec2(0.0, 1.0);
    vec2 d = a + vec2(1.0, 1.0);

    float f = hashAngle(a);
    vec2 aG = vec2(cos(f), sin(f));
    f = hashAngle(b);
    vec2 bG = vec2(cos(f), sin(f));
    f = hashAngle(c);
    vec2 cG = vec2(cos(f), sin(f));
    f = hashAngle(d);
    vec2 dG = vec2(cos(f), sin(f));

    float aD = dot(aG, p - a);
    float bD = dot(bG, p - b);
    float cD = dot(cG, p - c);
    float dD = dot(dG, p - d);

    l = l * l * l * (l * (l * 6.0 - 15.0) + 10.0);

    float noise = (mix(mix(aD, bD, l.x), mix(cD, dD, l.x), l.y));
    return noise * 0.5 + 0.5;
}

float voronoiNoise(vec2 p)
{
    vec2 cell = floor(p);
    vec2 local = fract(p);

    float minDist = 10.0;

    float d1 = 10.0;
    float d2 = 10.0;

    for(int x = -1; x <= 1; x++)
    {
        for(int y = -1; y <= 1; y++)
        {
            vec2 offset = vec2(float(x), float(y));

            vec2 point = hash2D(cell + offset);

            vec2 r = offset + point - local;

            float d = length(r);

            d2 = min(d2, max(d1, d));
            d1 = min(d1, d);
        }
    }

    // float dTotal = d1 + d2;
    // float t = d1 / dTotal;

    // float mask = step(abs(0.5 - t), 0.03);
    // return 1.0 - abs(0.5 - t);

    // float l = max(0.9, minDist);
    // float l = smoothstep(0.12, 0.15, minDist);
    // return l;
    return d1;
}

vec2 displacedNoise(vec2 uv)
{
    vec2 d = vec2(noise(uv) + 0.3 * u_time, noise(vec2(uv.x, uv.y) + 0.2 * u_time));
    return d * 2.0 - 1.0;
}

float fbm(vec2 p)
{
    int n = 5;
    float f = 1.0;
    float fi = 2.0;
    float a = 0.5;
    float ai = 0.5;
    float total = 0.0;

    for(int i = 0; i < n; i++)
    {
        total += a * perlinNoise(f * p);

        a *= ai;
        f *= fi;
    }

    return total;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec2 p = uv * vec2(6.0, 6.0);
    vec3 purple = vec3(0.365, 0.125, 0.874);

    // p = displacedNoise(p);

    // float pattern = fbm(p);

    vec2 displaced = vec2(fbm(p + u_time), fbm(p + vec2(5.0, 9.0) + u_time));

    float pattern = fbm(p + 0.5 * displaced);

    // pattern = step(0.0, pattern);

    // float pattern = noise(p);
    vec3 color = vec3(pattern * purple);
    outColor = vec4(color, 1.0);

    // float pattern = voronoiNoise(p);

    // float dx = dFdx(pattern);
    // float dy = dFdy(pattern);

    // float gradient = length(vec2(dx, dy)) * 30.0;
    // float intensity = smoothstep(0.1, 0.5, gradient);

    // outColor = vec4(abs(dx) * 100.0, abs(dy) * 100.0, 0.0, 1.0);
    // outColor = vec4(intensity, intensity, intensity, 1.0);

    // // vec3 purple = vec3(0.145, 0.035, 0.161);
    // float mask = pattern;
    // // float mask = gradient;
    // vec3 color = purple * pattern;
    // outColor = vec4(color, 1.0);

}