import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Register plugins if needed
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export { gsap, useGSAP };
export default gsap;
