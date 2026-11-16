import React, { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';

interface LottieAnimationProps {
  path: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  path,
  className = 'w-28 h-28 mx-auto',
  loop = true,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      path,
    });

    return () => {
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, [path, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
};
