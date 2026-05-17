import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// Theme-aware palettes
// Brighter, higher opacity for dark mode to make them glow and stand out
const DARK_PALETTE = [
  'rgba(255, 255, 255, 0.65)',
  'rgba(147, 197, 253, 0.70)',
  'rgba(252, 165, 165, 0.65)',
  'rgba(253, 230, 138, 0.60)',
  'rgba(196, 181, 253, 0.65)',
];

// Darker, richer colors with higher contrast for light mode
const LIGHT_PALETTE = [
  'rgba(49, 46, 129, 0.35)',
  'rgba(15, 118, 110, 0.30)',
  'rgba(153, 27, 27, 0.25)',
  'rgba(67, 56, 202, 0.30)',
  'rgba(30, 58, 138, 0.30)',
];

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId;
    let particles = [];

    const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

    const mouse = { x: -9999, y: -9999 };
    const REPEL_RADIUS = 130;
    const REPEL_STRENGTH = 6;

    function createParticle() {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        baseVx: Math.cos(angle) * speed,
        baseVy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 1,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const targetCount = Math.round((width * height) / 7000);
      if (particles.length < targetCount) {
        while (particles.length < targetCount) particles.push(createParticle());
      } else {
        particles.length = targetCount;
      }
    }

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const pushX = (dx / dist) * force * REPEL_STRENGTH;
          const pushY = (dy / dist) * force * REPEL_STRENGTH;
          p.vx += (pushX - p.vx) * 0.08;
          p.vy += (pushY - p.vy) * 0.08;
        } else {
          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.radius) p.x = width + p.radius;
        else if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        else if (p.y > height + p.radius) p.y = -p.radius;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
