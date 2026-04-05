'use client';

import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        blurPass={undefined}
        width={300}
        height={300}
        kernelSize={5}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.025}
        mipmapBlur={true}
      />
      <Noise
        opacity={0.03}
        blendFunction={BlendFunction.COLOR_DODGE}
      />
    </EffectComposer>
  );
}
