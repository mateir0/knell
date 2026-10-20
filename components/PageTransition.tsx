"use client";

import gsap from "gsap";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { strings } from "@/lib/strings";

function labelFor(pathname: string): string {
  return pathname === "/run" ? strings.nav.run : strings.nav.wordmark;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const inFlightRef = useRef(false);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      if (inFlightRef.current) {
        return;
      }

      const anchor =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !anchor ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const rawHref = anchor.getAttribute("href");
      if (!rawHref) {
        return;
      }

      const url = new URL(rawHref, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }
      if (url.pathname === window.location.pathname) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      inFlightRef.current = true;
      setDestination(labelFor(url.pathname));

      const wrapper = wrapperRef.current;
      if (wrapper) {
        gsap.to(wrapper, {
          scale: 0.6,
          opacity: 0.45,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            window.scrollTo(0, 0);
            router.push(`${url.pathname}${url.search}${url.hash}`, {
              scroll: false,
            });
          },
        });

        const drift =
          (wrapper.firstElementChild as HTMLElement | null) ?? wrapper;
        gsap.to(drift, {
          yPercent: -10,
          duration: 0.8,
          ease: "power3.inOut",
        });
      }

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      if (labelRef.current) {
        gsap.fromTo(
          labelRef.current,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [router]);

  useLayoutEffect(() => {
    if (!inFlightRef.current) {
      return;
    }
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }
    window.scrollTo(0, 0);

    gsap.set(wrapper, {
      scale: 0.6,
      opacity: 1,
      clipPath: "inset(100% 0 0 0)",
    });

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    gsap.to(wrapper, {
      scale: 1,
      clipPath: "inset(0% 0 0% 0)",
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        inFlightRef.current = false;
        setDestination(null);
        gsap.set(wrapper, { clearProps: "all" });
      },
    });
  }, [pathname]);

  return (
    <>
      <div ref={wrapperRef} className="min-h-screen">
        {children}
      </div>
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center opacity-0"
      >
        <p
          ref={labelRef}
          className="knell-display-lg text-display-lg uppercase text-ink"
        >
          {destination}
        </p>
      </div>
    </>
  );
}
