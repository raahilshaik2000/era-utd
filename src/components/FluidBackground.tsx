"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/loaded";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain-warped fbm "ink in water", pulled toward the cursor.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uIntensity;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
float fbm(vec2 p){
  float a=.5,s=0.;
  mat2 R=mat2(.8,.6,-.6,.8);
  for(int i=0;i<5;i++){s+=a*noise(p);p=R*p*2.02;a*=.5;}
  return s;
}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 mp=(uMouse-.5*uRes)/uRes.y;
  float d=length(p-mp);
  float t=uTime*.05;

  vec2 q=vec2(fbm(p*1.5+t),fbm(p*1.5+vec2(5.2,1.3)-t));
  vec2 w=p*1.3+2.4*q+vec2(0.,uScroll*.5);
  w-=(p-mp)*exp(-d*3.2)*.9;
  float f=fbm(w+t*1.6);

  vec3 black=vec3(.004,.012,.014);
  vec3 deep=vec3(.0,.16,.17);
  vec3 teal=vec3(.03,.40,.40);
  vec3 glow=vec3(.27,.83,.77);

  vec3 col=mix(black,deep,smoothstep(.25,.75,f));
  col=mix(col,teal,smoothstep(.55,.92,f)*.9);
  col+=glow*pow(smoothstep(.68,1.,f),2.5)*.5;
  col+=teal*exp(-d*4.5)*.25;

  col*=smoothstep(1.45,.2,length(p*vec2(.85,1.15)));
  col*=uIntensity;
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}`;

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const baseIntensity = useRef(1);

  useEffect(() => {
    baseIntensity.current = pathname === "/" ? 1 : 0.7;
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uIntensity = gl.getUniformLocation(prog, "uIntensity");

    // Render below native res: it's soft noise, nobody sees the difference, GPUs do.
    const SCALE = 0.55;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * SCALE);
      canvas.height = Math.floor(window.innerHeight * SCALE);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const target = { x: canvas.width * 0.5, y: canvas.height * 0.55 };
    const mouse = { ...target };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX * SCALE;
      target.y = (window.innerHeight - e.clientY) * SCALE;
    };
    window.addEventListener("pointermove", onMove);

    let intensity = baseIntensity.current;
    let raf = 0;
    const start = performance.now();
    const reduced = prefersReducedMotion();

    const frame = () => {
      const t = reduced ? 20 : (performance.now() - start) / 1000;
      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      const sy = window.scrollY / window.innerHeight;
      // Dim as you scroll so body copy stays readable, without ever going flat black.
      const goal = baseIntensity.current * Math.max(0.42, 1 - sy * 0.45);
      intensity += (goal - intensity) * 0.05;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, sy);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
