import { makeStyles, List } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import eventHandlers from './eventHandlers';

const generateKey = (item) => {
  if (typeof item === typeof '') {
    return item;
  }

  if (item._id) {
    return item._id;
  }

  return item.toString();
};

const useStyles = makeStyles(() => ({
  list: {
    overflowX: 'hidden',
  },
  listItem: {},
}));

const SwipeableList = ({
  generateListItem,
  children,
  items,
  onChange,
  generateKey,
  maxAnimationCount,
  maxSearchDepth,
  dragBoundary,
  className,
  ...props
}) => {
  const classes = useStyles();

  const { onStart, onMove, onEnd } = useMemo(
    () =>
      eventHandlers({
        maxAnimationCount,
        maxSearchDepth,
        dragBoundary,
        onChange,
        classes,
      }),
    [maxAnimationCount, onChange, maxSearchDepth, classes, dragBoundary],
  );

  const getListItem = useMemo(() => children ?? generateListItem, [
    children,
    generateListItem,
  ]);

  useEffect(() => {
    // TODO: Replace with element level listeners, if possible
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, []);

  return (
    <List className={`${classes.list} ${className}`} {...props}>
      {items.map((...args) => {
        const listItem = getListItem(...args);
        const [item, index] = args;

        return (
          <div
            listitemindex={index}
            key={generateKey(item)}
            listitemprop={classes.listItem}
          >
            {listItem}
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
  maxAnimationCount: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  generateListItem: PropTypes.func,
  maxSearchDepth: PropTypes.number,
  dragBoundary: PropTypes.number,
  generateKey: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.func,
};

export default SwipeableList;
