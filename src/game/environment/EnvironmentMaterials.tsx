import {
  CanvasTexture,
  Color,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Material,
} from 'three';
import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { createSeededRandom } from '../../utils/random';

export type EnvironmentMaterialKey =
  | 'paint'
  | 'concrete'
  | 'tile'
  | 'dark'
  | 'floor'
  | 'floorTile'
  | 'ceiling'
  | 'metal'
  | 'rust'
  | 'wood'
  | 'paper'
  | 'fabric'
  | 'black'
  | 'glass'
  | 'rubber'
  | 'red'
  | 'green';

type MaterialLibrary = Record<EnvironmentMaterialKey, MeshStandardMaterial>;

const MaterialsContext = createContext<MaterialLibrary | null>(null);

const makeTexture = (
  base: string,
  seed: number,
  mode: 'noise' | 'tile' | 'wood' = 'noise',
): CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas textures are unavailable.');
  const random = createSeededRandom(seed);
  context.fillStyle = base;
  context.fillRect(0, 0, 192, 192);

  if (mode === 'tile') {
    context.strokeStyle = 'rgba(8, 11, 11, .55)';
    context.lineWidth = 3;
    for (let line = 0; line <= 192; line += 48) {
      context.beginPath();
      context.moveTo(line, 0);
      context.lineTo(line, 192);
      context.stroke();
      context.beginPath();
      context.moveTo(0, line);
      context.lineTo(192, line);
      context.stroke();
    }
  } else if (mode === 'wood') {
    for (let line = 0; line < 30; line += 1) {
      context.strokeStyle = `rgba(20, 11, 7, ${0.06 + random() * 0.12})`;
      context.lineWidth = 1 + random() * 2;
      context.beginPath();
      const y = random() * 192;
      context.moveTo(0, y);
      context.bezierCurveTo(48, y + random() * 10, 120, y - random() * 8, 192, y + random() * 6);
      context.stroke();
    }
  }

  for (let speck = 0; speck < 900; speck += 1) {
    const shade = random() > 0.5 ? 255 : 0;
    context.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${random() * 0.035})`;
    const size = 0.4 + random() * 2.2;
    context.fillRect(random() * 192, random() * 192, size, size);
  }
  for (let stain = 0; stain < 12; stain += 1) {
    const x = random() * 192;
    const y = random() * 192;
    const radius = 4 + random() * 22;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(13, 16, 14, .09)');
    gradient.addColorStop(1, 'rgba(13, 16, 14, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(mode === 'tile' ? 3 : 2, mode === 'tile' ? 3 : 2);
  texture.anisotropy = 2;
  return texture;
};

const material = (
  color: string,
  roughness: number,
  metalness: number,
  map?: CanvasTexture,
): MeshStandardMaterial =>
  new MeshStandardMaterial({ color: new Color(color), roughness, metalness, map: map ?? null });

const createLibrary = (): MaterialLibrary => {
  const paintMap = makeTexture('#65706a', 11);
  const concreteMap = makeTexture('#4a4c49', 23);
  const tileMap = makeTexture('#69736f', 31, 'tile');
  const darkMap = makeTexture('#343936', 42);
  const floorMap = makeTexture('#313634', 58, 'tile');
  const woodMap = makeTexture('#4b3324', 71, 'wood');
  return {
    paint: material('#737c75', 0.92, 0, paintMap),
    concrete: material('#555957', 1, 0, concreteMap),
    tile: material('#77827e', 0.72, 0.02, tileMap),
    dark: material('#414744', 0.94, 0, darkMap),
    floor: material('#3b403d', 0.88, 0.02, floorMap),
    floorTile: material('#555e5a', 0.72, 0.03, tileMap),
    ceiling: material('#60645f', 1, 0, concreteMap),
    metal: material('#626966', 0.54, 0.52),
    rust: material('#5a3324', 0.85, 0.38),
    wood: material('#513828', 0.83, 0.03, woodMap),
    paper: material('#b3ad98', 0.94, 0),
    fabric: material('#4a5653', 1, 0),
    black: material('#080a09', 0.95, 0.05),
    glass: new MeshStandardMaterial({
      color: '#50615f',
      roughness: 0.22,
      metalness: 0.05,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
    rubber: material('#151817', 0.96, 0),
    red: material('#5d1c1a', 0.82, 0.08),
    green: material('#3f5a4b', 0.78, 0.06),
  };
};

export const EnvironmentMaterials = ({ children }: PropsWithChildren): React.JSX.Element => {
  const library = useMemo(createLibrary, []);
  useEffect(
    () => () => {
      const disposed = new Set<Material>();
      Object.values(library).forEach((entry) => {
        if (!disposed.has(entry)) {
          entry.map?.dispose();
          entry.dispose();
          disposed.add(entry);
        }
      });
    },
    [library],
  );
  return <MaterialsContext value={library}>{children}</MaterialsContext>;
};

export const useEnvironmentMaterials = (): MaterialLibrary => {
  const library = useContext(MaterialsContext);
  if (!library) throw new Error('Environment materials must be used inside their provider.');
  return library;
};
