export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  readonly masterVolume: number;
  readonly musicVolume: number;
  readonly sfxVolume: number;
  readonly mouseSensitivity: number;
  readonly graphicsQuality: GraphicsQuality;
  readonly brightness: number;
  readonly reducedMotion: boolean;
  readonly headBob: boolean;
  readonly captions: boolean;
}

export type NumericSettingKey =
  'masterVolume' | 'musicVolume' | 'sfxVolume' | 'mouseSensitivity' | 'brightness';

export type BooleanSettingKey = 'reducedMotion' | 'headBob' | 'captions';
