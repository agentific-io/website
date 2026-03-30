'use client';

import { useEffect, useRef, type FC } from 'react';
import { CSS_VARS } from '@/lib/styles';

const DotGrid: FC = () => {
  const glowRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const glowC = glowRef.current;
    const maskC = maskRef.current;
    if (!glowC || !maskC) return;

    const gCtx = glowC.getContext('2d')!;
    const mCtx = maskC.getContext('2d')!;

    const DOT_R = 1.5;
    const SPACING = 22;
    const FADE_DELAY = 120;

    let W = window.innerWidth;
    let H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    let mx = W / 2, my = H / 2;
    let tx = W / 2, ty = H / 2;
    let brightness = 0, scale = 0;
    let lastMove = 0;
    let animId: number;

    const drawMask = () => {
      mCtx.clearRect(0, 0, W, H);
      mCtx.fillStyle = CSS_VARS.bg;
      mCtx.fillRect(0, 0, W, H);
      mCtx.globalCompositeOperation = 'destination-out';
      for (let x = SPACING / 2; x < W; x += SPACING) {
        for (let y = SPACING / 2; y < H; y += SPACING) {
          mCtx.beginPath();
          mCtx.arc(x, y, DOT_R, 0, Math.PI * 2);
          mCtx.fillStyle = 'rgba(0,0,0,1)';
          mCtx.fill();
        }
      }
      mCtx.globalCompositeOperation = 'source-over';
    };

    const resize = () => {
      W = window.innerWidth;
      H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      glowC.width = maskC.width = W;
      glowC.height = maskC.height = H;
      drawMask();
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const drawGlow = (x: number, y: number, b: number, sc: number) => {
      gCtx.clearRect(0, 0, W, H);
      if (b <= 0.01) return;
      const maxR = 150 * sc;
      const midR = maxR * 0.35;
      const coreR = maxR * 0.08;

      let g = gCtx.createRadialGradient(x, y, midR * 0.5, x, y, maxR);
      g.addColorStop(0, `rgba(200,210,240,${b * 0.15})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);

      g = gCtx.createRadialGradient(x, y, coreR, x, y, midR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.5})`);
      g.addColorStop(0.5, `rgba(210,220,245,${b * 0.2})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);

      g = gCtx.createRadialGradient(x, y, 0, x, y, coreR);
      g.addColorStop(0, `rgba(255,255,255,${b * 0.8})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      gCtx.fillStyle = g;
      gCtx.fillRect(0, 0, W, H);
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      tx = lerp(tx, mx, 0.1);
      ty = lerp(ty, my, 0.1);
      const moving = performance.now() - lastMove < FADE_DELAY;
      brightness = lerp(brightness, moving ? 1 : 0, moving ? 0.06 : 0.04);
      scale = lerp(scale, moving ? 1 : 0, moving ? 0.05 : 0.04);
      drawGlow(tx, ty, brightness, scale);
    };

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY + window.scrollY;
      lastMove = performance.now();
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    pointerEvents: 'none',
  };

  return (
    <>
      <canvas ref={glowRef} style={{ ...canvasStyle, zIndex: 0 }} />
      <canvas ref={maskRef} style={{ ...canvasStyle, zIndex: 1 }} />
    </>
  );
};

export default DotGrid;
