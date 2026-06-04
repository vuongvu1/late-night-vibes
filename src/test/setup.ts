import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom doesn't implement ResizeObserver, which the panels rely on (via
// useResizable). Provide a no-op so components render in tests. The
// useResizable unit test overrides this with a controllable mock.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
