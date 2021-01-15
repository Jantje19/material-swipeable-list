import { makeStyles, List } from '@material-ui/core';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
  list: {
    overflowX: 'hidden',
  },
  listItem: {},
}));

const generateKey = (item) => {
  if (typeof item === typeof '') {
    return item;
  }

  if (item?._id) {
    return item._id;
  }

  return item.toString();
}

const SwipeableList = ({ generateListItem, items, onChange, generateKey, maxAnimationCount, maxSearchDepth, dragBoundary, className, ...props }) => {
  const classes = useStyles();

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
    const opacity = 1 - normalizedDragDistance ** 2;

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
                elem.style.transition = 'transform .15s cubic-bezier(0, 0, 0.31, 1)';
                elem.style.transform = 'none';
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

    const elemTarget = (() => {
      for (let i = 0; i < Math.min(evt.path.length, maxSearchDepth); i++) {
        const elem = evt.path[i];

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

  useEffect(() => {
    document.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', onStart, { passive: false });
      document.removeEventListener('touchmove', onMove, { passive: false });
      document.removeEventListener('touchend', onEnd, { passive: false });
    };
  }, []);

  return (
    <List className={`${classes.list} ${className}`} {...props}>
      {items.map((...args) => {
        const [item, index] = args;

        return (
          <div key={generateKey(item)} listitemindex={index} listitemprop={classes.listItem}>
            {generateListItem(...args)}
          </div>
        );
      })}
    </List>
  );
};

SwipeableList.defaultProps = {
  maxAnimationCount: 8, // The max amount of elements to animate
  maxSearchDepth: 10, // The search depth for a list item when an element is touched (on start)
  dragBoundary: 0.35, // Item dismissal threshold
  className: '',
  generateKey,
};
SwipeableList.propTypes = {
  generateListItem: PropTypes.func.isRequired,
  maxAnimationCount: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  maxSearchDepth: PropTypes.number,
  dragBoundary: PropTypes.number,
  generateKey: PropTypes.func,
  className: PropTypes.string,
};

export default SwipeableList;
