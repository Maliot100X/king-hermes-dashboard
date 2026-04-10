'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Page load animation
export function usePageLoadAnimation() {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Header slides down
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );
    }

    // Tabs stagger in
    if (tabsRef.current) {
      tl.fromTo(
        tabsRef.current.children,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 },
        '-=0.4'
      );
    }

    // Content fades in and scales up
    if (contentRef.current) {
      tl.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.3'
      );
    }
  }, []);

  return { headerRef, tabsRef, contentRef };
}

// Tab switch animation
export function useTabSwitchAnimation(activeTab: string) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  return contentRef;
}

// Card hover animation
export function useCardHoverAnimation(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        y: -4,
        boxShadow: '0 0 20px rgba(0, 217, 146, 0.3)',
        borderColor: '#00d992',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        y: 0,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        borderColor: '#3d3a39',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);
}

// Pulse animation for status indicators
export function usePulseAnimation(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!ref.current || !isActive) return;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(ref.current, {
      scale: 1.1,
      opacity: 0.8,
      duration: 0.5,
      ease: 'power2.inOut',
    }).to(ref.current, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
    };
  }, [ref, isActive]);
}

// Chart line draw animation
export function useChartAnimation(ref: React.RefObject<SVGElement>) {
  useEffect(() => {
    if (!ref.current) return;

    const paths = ref.current.querySelectorAll('path');
    
    paths.forEach((path) => {
      const length = (path as SVGPathElement).getTotalLength?.() || 1000;
      
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.out',
      });
    });
  }, [ref]);
}

// Stagger animation for lists
export function useStaggerAnimation(ref: React.RefObject<HTMLElement>, items: any[]) {
  useEffect(() => {
    if (!ref.current) return;

    const children = ref.current.children;
    
    gsap.fromTo(
      children,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.4,
        ease: 'power2.out',
      }
    );
  }, [ref, items]);
}

// Floating animation
export function useFloatAnimation(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [ref]);
}

// Slide in from right (for notifications, etc.)
export function useSlideInRight(ref: React.RefObject<HTMLElement>, trigger: boolean) {
  useEffect(() => {
    if (!ref.current || !trigger) return;

    gsap.fromTo(
      ref.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  }, [ref, trigger]);
}
