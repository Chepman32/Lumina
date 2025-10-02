import React, { useEffect, useMemo, useRef } from 'react';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Rect,
  vec,
  Blur,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
  useFrameCallback,
} from 'react-native-reanimated';
import { SCREEN_WIDTH, SCREEN_HEIGHT, COLORS } from '../../utils/constants';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  mass: number;
  color: string;
  originalX: number;
  originalY: number;
}

const PARTICLE_COLORS = ['#FF6B9D', '#C44EFF', '#4E9FFF', '#FFC44E', '#4EFFB4'];
const NUM_PARTICLES = 120;
const SCREEN_CENTER_X = SCREEN_WIDTH / 2;
const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

interface Props {
  onComplete: () => void;
}

export default function PhysicsAnimation({ onComplete }: Props) {
  const particles = useRef<Particle[]>([]);
  const animationPhase = useSharedValue(0);
  const logoOpacity = useSharedValue(1);

  // Initialize particles in a circular logo pattern
  useEffect(() => {
    const newParticles: Particle[] = [];
    const radius = 100;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = (i / NUM_PARTICLES) * Math.PI * 2;
      const r = radius * (0.5 + Math.random() * 0.5);
      const px = SCREEN_CENTER_X + Math.cos(angle) * r;
      const py = SCREEN_CENTER_Y + Math.sin(angle) * r;

      newParticles.push({
        id: `particle_${i}`,
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        size: 3 + Math.random() * 5,
        mass: 0.5 + Math.random() * 0.5,
        color:
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        originalX: px,
        originalY: py,
      });
    }

    particles.current = newParticles;
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Phase 1: Explosion (0-0.8s)
    animationPhase.value = withTiming(1, { duration: 800 }, () => {
      // Phase 2: Swirl (0.8-1.8s)
      animationPhase.value = withTiming(2, { duration: 1000 }, () => {
        // Phase 3: Reconstruction (1.8-2.5s)
        animationPhase.value = withSpring(
          3,
          { damping: 12, stiffness: 80 },
          () => {
            runOnJS(onComplete)();
          },
        );
      });
    });

    logoOpacity.value = withTiming(0, { duration: 300 });
  };

  // Physics update loop
  useFrameCallback(frameInfo => {
    const phase = animationPhase.value;
    const dt = (frameInfo.timeSincePreviousFrame || 16) / 1000;

    particles.current.forEach(particle => {
      if (phase < 1) {
        // Explosion phase - radial force outward
        const dx = particle.x - SCREEN_CENTER_X;
        const dy = particle.y - SCREEN_CENTER_Y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = phase * 500;

        particle.vx = (dx / distance) * force;
        particle.vy = (dy / distance) * force;
      } else if (phase < 2) {
        // Swirl phase - vortex force
        const dx = particle.x - SCREEN_CENTER_X;
        const dy = particle.y - SCREEN_CENTER_Y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        // Tangential force for swirl
        const tangentX = -dy / distance;
        const tangentY = dx / distance;
        const vortexStrength = 300 * (phase - 1);

        particle.vx += tangentX * vortexStrength * dt;
        particle.vy += tangentY * vortexStrength * dt;

        // Gravity toward center
        particle.vx -= (dx / distance) * 100 * dt;
        particle.vy -= (dy / distance) * 100 * dt;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
      } else {
        // Reconstruction phase - magnetic pull to original position
        const dx = particle.originalX - particle.x;
        const dy = particle.originalY - particle.y;
        const springStrength = 0.15;
        const damping = 0.9;

        particle.vx = (particle.vx + dx * springStrength) * damping;
        particle.vy = (particle.vy + dy * springStrength) * damping;
      }

      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Boundary collision
      if (particle.x < 0) {
        particle.x = 0;
        particle.vx *= -0.5;
      }
      if (particle.x > SCREEN_WIDTH) {
        particle.x = SCREEN_WIDTH;
        particle.vx *= -0.5;
      }
      if (particle.y < 0) {
        particle.y = 0;
        particle.vy *= -0.5;
      }
      if (particle.y > SCREEN_HEIGHT) {
        particle.y = SCREEN_HEIGHT;
        particle.vy *= -0.5;
      }
    });
  }, true);

  return (
    <Canvas style={{ flex: 1 }}>
      {/* Background gradient */}
      <Rect x={0} y={0} width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(SCREEN_WIDTH, SCREEN_HEIGHT)}
          colors={['#0F0F1E', '#1A1A3E', '#2D1B69']}
        />
      </Rect>

      {/* Particle system */}
      <Group>
        {particles.current.map(particle => (
          <Group key={particle.id}>
            {/* Glow effect */}
            <Circle
              cx={particle.x}
              cy={particle.y}
              r={particle.size * 2}
              color={particle.color}
              opacity={0.3}
            >
              <Blur blur={10} />
            </Circle>

            {/* Particle core */}
            <Circle cx={particle.x} cy={particle.y} r={particle.size}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(particle.size * 2, particle.size * 2)}
                colors={[particle.color, adjustBrightness(particle.color, -30)]}
              />
            </Circle>
          </Group>
        ))}
      </Group>
    </Canvas>
  );
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
