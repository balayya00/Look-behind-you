import { CanvasTexture, SRGBColorSpace } from 'three';
import { useEffect, useMemo } from 'react';
import type { SignDefinition } from '../../data/level';

export const Sign = ({
  definition,
}: {
  readonly definition: SignDefinition;
}): React.JSX.Element => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Sign texture canvas is unavailable.');
    context.fillStyle = '#c5c2b4';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(255,255,255,.08)');
    gradient.addColorStop(1, 'rgba(12,16,14,.22)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = definition.color ?? '#4a5551';
    context.lineWidth = 12;
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = definition.color ?? '#27312e';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '700 46px Arial, sans-serif';
    context.fillText(definition.text, 256, definition.subtext ? 75 : 96);
    if (definition.subtext) {
      context.font = '600 24px Arial, sans-serif';
      context.letterSpacing = '3px';
      context.fillText(definition.subtext, 256, 126);
    }
    for (let line = 0; line < 28; line += 1) {
      context.strokeStyle = `rgba(20,25,23,${0.02 + (line % 4) * 0.009})`;
      context.beginPath();
      const x = (line * 83) % 500;
      const y = (line * 47) % 180;
      context.moveTo(x, y);
      context.lineTo(x + 8 + (line % 5) * 4, y + (line % 3) * 2);
      context.stroke();
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [definition]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={definition.position} rotation={[0, definition.rotationY, 0]}>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[1.85, 0.72, 0.055]} />
        <meshStandardMaterial color="#292e2c" roughness={0.8} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.76, 0.64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};
