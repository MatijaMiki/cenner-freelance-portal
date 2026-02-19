
import React, { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  parallax?: boolean;
}

const NeuralBackground: React.FC<NeuralBackgroundProps> = ({ parallax = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let nodes: Node[] = [];
    let globes: Globe[] = [];
    let dataStreams: DataStream[] = [];
    
    const nodeCount = 120; 
    const connectionDistance = 250; 
    let rotation = 0;

    class Node {
      x: number; y: number; z: number;
      originX: number; originY: number; originZ: number;
      size: number;
      color: string;
      isPink: boolean;
      pulse: number;
      isCore: boolean;

      constructor() {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        this.isCore = Math.random() > 0.85;
        const r = this.isCore 
          ? (Math.random() * 150 + 50) 
          : (Math.random() * 500 + 200);
        
        this.originX = r * Math.sin(phi) * Math.cos(theta);
        this.originY = r * Math.sin(phi) * Math.sin(theta);
        this.originZ = r * Math.cos(phi);
        
        this.x = this.originX;
        this.y = this.originY;
        this.z = this.originZ;
        
        this.isPink = Math.random() > 0.5;
        this.size = this.isCore ? Math.random() * 4 + 3 : Math.random() * 1.5 + 0.5;
        this.color = this.isPink ? '#f472b6' : '#4ade80';
        this.pulse = Math.random() * Math.PI * 2;
      }

      rotate(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        let x = this.originX * cos - this.originZ * sin;
        let z = this.originX * sin + this.originZ * cos;
        this.pulse += 0.005;
        const wobble = Math.sin(this.pulse) * 5;
        this.x = x + wobble;
        this.z = z;
        this.y = this.originY + wobble;
      }

      project(w: number, h: number, currentScroll: number) {
        const fieldOfView = 1000;
        const scale = fieldOfView / (fieldOfView + this.z);
        const px = this.x * scale + w / 2;
        const py = this.y * scale + h / 2 - (parallax ? currentScroll * 0.1 : 0);
        return { px, py, scale };
      }
    }

    class Globe {
      x: number; y: number; z: number;
      radius: number;
      rotation: number;
      color: string;

      constructor(x: number, y: number, z: number, radius: number, isPink: boolean) {
        this.x = x; this.y = y; this.z = z;
        this.radius = radius;
        this.rotation = Math.random() * Math.PI * 2;
        this.color = isPink ? 'rgba(244, 114, 182, 0.15)' : 'rgba(74, 222, 128, 0.15)';
      }

      draw(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number, globalRot: number) {
        this.rotation += 0.002;
        const fieldOfView = 1000;
        
        // Simplified 3D projection for globe center
        const cosR = Math.cos(globalRot * 0.5);
        const sinR = Math.sin(globalRot * 0.5);
        const rx = this.x * cosR - this.z * sinR;
        const rz = this.x * sinR + this.z * cosR;
        
        const scale = fieldOfView / (fieldOfView + rz);
        const px = rx * scale + w / 2;
        const py = this.y * scale + h / 2 - (parallax ? scroll * 0.1 : 0);

        if (scale < 0) return;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.5 * scale;
        
        // Draw longitude lines
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(px, py, this.radius * scale, (this.radius * Math.abs(Math.sin(this.rotation + i * Math.PI / 6))) * scale, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw latitude lines
        for (let i = 1; i < 4; i++) {
          const latRadius = Math.sin(i * Math.PI / 4) * this.radius * scale;
          const latY = py + Math.cos(i * Math.PI / 4) * this.radius * scale;
          ctx.beginPath();
          ctx.arc(px, py + (i-2)*20*scale, latRadius, 0, Math.PI * 2);
          // Simplified latitude for performance
          ctx.stroke();
        }
      }
    }

    class DataStream {
      node: Node;
      text: string;
      offset: {x: number, y: number, z: number};

      constructor(node: Node) {
        this.node = node;
        this.text = Math.floor(Math.random() * 10000000).toString();
        this.offset = {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 40,
          z: (Math.random() - 0.5) * 40
        };
      }

      draw(ctx: CanvasRenderingContext2D, w: number, h: number, scroll: number) {
        const fieldOfView = 1000;
        const scale = fieldOfView / (fieldOfView + this.node.z + this.offset.z);
        const px = (this.node.x + this.offset.x) * scale + w / 2;
        const py = (this.node.y + this.offset.y) * scale + h / 2 - (parallax ? scroll * 0.1 : 0);

        if (scale < 0.2) return;

        ctx.font = `${Math.floor(10 * scale)}px monospace`;
        ctx.fillStyle = this.node.isPink ? `rgba(244, 114, 182, ${0.3 * scale})` : `rgba(74, 222, 128, ${0.3 * scale})`;
        ctx.fillText(this.text, px, py);
      }
    }

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      nodes = [];
      globes = [];
      dataStreams = [];
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
      }
      // Add a few globes
      globes.push(new Globe(-400, -100, 100, 180, false));
      globes.push(new Globe(450, 200, -200, 220, true));
      
      // Attach data streams to some nodes
      nodes.slice(0, 15).forEach(n => dataStreams.push(new DataStream(n)));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentScroll = scrollY.current;
      rotation += 0.0003;

      nodes.forEach(node => node.rotate(rotation));

      // Draw globes first (background)
      globes.forEach(g => g.draw(ctx, canvas.width, canvas.height, currentScroll, rotation));

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        const p1 = n1.project(canvas.width, canvas.height, currentScroll);

        if (p1.px < -300 || p1.px > canvas.width + 300 || p1.py < -300 || p1.py > canvas.height + 300) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < connectionDistance * connectionDistance) {
            const p2 = n2.project(canvas.width, canvas.height, currentScroll);
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / connectionDistance) * 0.2 * Math.min(p1.scale, p2.scale);
            
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = n1.isPink ? `rgba(244, 114, 182, ${opacity})` : `rgba(74, 222, 128, ${opacity})`;
            ctx.lineWidth = 0.5 * Math.min(p1.scale, p2.scale);
            ctx.stroke();
          }
        }
      }

      // Draw Data Streams
      dataStreams.forEach(ds => ds.draw(ctx, canvas.width, canvas.height, currentScroll));

      // Draw nodes with bloom/glow
      nodes.forEach(node => {
        const p = node.project(canvas.width, canvas.height, currentScroll);
        if (p.px > -50 && p.px < canvas.width + 50 && p.py > -50 && p.py < canvas.height + 50) {
          
          if (node.isCore) {
            // Intensive glow for core nodes as seen in the image
            const gradient = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, node.size * p.scale * 4);
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(p.px, p.py, node.size * p.scale * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }

          ctx.beginPath();
          ctx.arc(p.px, p.py, node.size * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Small highlight
          ctx.beginPath();
          ctx.arc(p.px - (node.size * 0.3 * p.scale), p.py - (node.size * 0.3 * p.scale), node.size * 0.2 * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [parallax]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90"
      style={{ background: 'transparent' }}
    />
  );
};

export default NeuralBackground;
