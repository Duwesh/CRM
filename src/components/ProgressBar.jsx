"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return;
      if (href !== pathname) NProgress.start();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}

export default function ProgressBar() {
  return (
    <>
      <style>{`
        #nprogress { pointer-events: none; }
        #nprogress .bar {
          background: #c9a84c;
          position: fixed;
          z-index: 9999;
          top: 0; left: 0;
          width: 100%; height: 2px;
        }
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0; width: 100px; height: 100%;
          box-shadow: 0 0 10px #c9a84c, 0 0 5px #c9a84c;
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
    </>
  );
}
