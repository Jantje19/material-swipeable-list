export default ({
  maxAnimationCount,
  onChange,
  maxSearchDepth,
  classes,
  dragBoundary,
}) => {
  let draggingCard = false;
  let isAnimating = false;
  let containerBCR = null;
  let targetBCR = null;
  let target = null;
  let currentX = 0;
  let screenX = 0;
  let targetX = 0;
  let startX = 0;

  const update = () => {
    if (isAnimating) {
      requestAnimationFrame(update);
    }

    if (!target) {
      return;
    }

    if (draggingCard) {
      screenX = currentX - startX;
    } else {
      screenX += (targetX - screenX) / 4;
    }

    const normalizedDragDistance = Math.abs(screenX) / targetBCR.width;
    const opacity = 1 - normalizedDragDistance ** 3;

    target.style.transform = `translateX(${screenX}px)`;
    target.style.opacity = opacity;

    const isNearlyInvisible = opacity < 0.01;
    const isNearlyAtStart = Math.abs(screenX) < 0.01;

    if (!draggingCard) {
      if (isNearlyInvisible || isNearlyAtStart) {
        isAnimating = false;

        requestAnimationFrame(update);
      }

      if (isNearlyInvisible) {
        if (!target?.parentNode) {
          target = null;

          return;
        }

        if (!target.nextElementSibling) {
          target.parentNode.style.height = null;
        } else {
          // Animates most off/all the items below the dismissed item
          (function nextSibling(elem, index = 0) {
            if (elem && index < maxAnimationCount) {
              const onTransitionEnd = () => {
                elem.style.transition = 'none';
                elem.removeEventListener('transitionend', onTransitionEnd);

                elem.parentNode.style.height = null;
              };

              // TODO: Replace this once Safari gets WebAnimations.onfinish support
              elem.style.transform = `translateY(${targetBCR.height}px)`;
              requestAnimationFrame(() => {
                elem.style.transform = 'none';
                elem.style.transition =
                  'transform .15s cubic-bezier(0, 0, 0.31, 1)';
              });

              elem.addEventListener('transitionend', onTransitionEnd);
              nextSibling(elem.nextElementSibling, index + 1);
            }
          })(target.nextElementSibling);

          target.parentNode.style.height = `${containerBCR.height}px`;
        }

        const index = parseInt(target.getAttribute('listitemindex'), 10);

        target.style.display = 'none';
        target = null;

        onChange(index);
      }

      if (isNearlyAtStart) {
        target.style.willChange = 'initial';
        target.style.transform = 'none';
        target = null;
      }
    }
  };

  const onStart = (evt) => {
    if (target) {
      return;
    }

    // TODO: Replace with elem.closest (if it is more performant...)
    const elemTarget = (() => {
      const path = evt.path ?? evt.composedPath();

      for (let i = 0; i < Math.min(path.length, maxSearchDepth); i++) {
        const elem = path[i];

        if (elem === document) {
          break;
        }

        if (elem.getAttribute('listitemprop') === classes.listItem) {
          return elem;
        }
      }

      return undefined;
    })();

    if (!elemTarget) {
      return;
    }

    // evt.preventDefault();

    target = elemTarget;
    targetBCR = target.getBoundingClientRect();
    containerBCR = target.parentNode.getBoundingClientRect();
    draggingCard = true;
    startX = evt.pageX ?? evt.touches[0].pageX;
    currentX = startX;

    // TODO: Pre-promote all items that are visible
    target.style.willChange = 'transform, opacity';

    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(update);
    }
  };

  const onMove = (evt) => {
    if (!target) {
      return;
    }

    currentX = evt.pageX ?? evt.touches[0].pageX;
  };

  const onEnd = () => {
    if (!target) {
      return;
    }

    targetX = 0;

    const localScreenX = currentX - startX;

    if (Math.abs(localScreenX) > targetBCR.width * dragBoundary) {
      targetX = localScreenX > 0 ? targetBCR.width : -targetBCR.width;
    }

    draggingCard = false;
  };

  return { onStart, onMove, onEnd };
};
