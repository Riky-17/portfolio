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

    float d = 10.0;

    for(int x = -1; x <= 1; x++)
    {
        for(int y = -1; y <= 1; y++)
        {
            vec2 offset = vec2(float(x), float(y));

            vec2 point = hash2D(cell + offset);

            vec2 r = offset + point - local;

            float dr = length(r);

            d = min(d, dr);
        }
    }

    return d;
}

float fbmPerlin(vec2 p)
{
    float f = 1.0;
    float a = 0.5;
    float total = 0.0;

    for(int i = 0; i < 5; i++)
    {
        total += a * perlinNoise(f * p);

        a *= 0.5;
        f *= 2.0;
    }

    return total;
}

float fbmVoronoi(vec2 p)
{
    float f = 1.0;
    float a = 0.5;
    float total = 0.0;

    for(int i = 0; i < 5; i++)
    {
        total += a * voronoiNoise(f * p);

        a *= 0.5;
        f *= 2.0;
    }

    return total;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec2 p = uv * vec2(6.0, 6.0);
    vec3 purple = vec3(0.365, 0.125, 0.874);

    vec2 displaced = vec2(fbmPerlin(p + 0.5 * u_time), fbmPerlin(p + 0.5 * u_time));

    float pattern = fbmVoronoi(p + 0.5 * displaced);

    vec3 color = vec3(pattern * purple);
    outColor = vec4(color, 1.0);
}