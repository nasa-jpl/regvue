export const getTextWidth = (text: string, font: string) => {
  let canvas = document.getElementsByTagName("canvas")[0];

  if (canvas == undefined) {
    canvas = document.createElement("canvas");
  }

  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;

    // Return the size of the text plus 48 pixels to preserve whitespace around text
    return context.measureText(text).width + 48;
  }

  return 0;
};

let observer: ResizeObserver | null;

export const vResponsiveRotate = {
  mounted: (element: HTMLElement) => {
    observer = new ResizeObserver((entries) => {
      // We use one observer per element, therefore each observer
      // is observing only a single element.  Entries will always
      // contain a single entry.
      const entry = entries[0];
      if (!entry) {
        throw Error("No entry found attached to this ResizeObserver");
      }

      const element = entry.target;
      const elementWidth = entry.contentRect.width;
      if (!element) {
        throw Error(
          "Could not find element from ResizeObserver's entry.target"
        );
      }

      const text = element.textContent as string;
      const font = window.getComputedStyle(element).font;
      const textWidth = getTextWidth(text, font);
      if (textWidth > elementWidth) {
        element.classList.add("rotate");
      } else {
        element.classList.remove("rotate");
      }
    });
    observer.observe(element);
  },

  unmounted: () => (observer = null),
};
