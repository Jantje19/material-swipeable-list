# Material swipeable list

> Swipeable Material-UI list component for React

[![NPM](https://img.shields.io/npm/v/material-swipeable-list.svg)](https://www.npmjs.com/package/material-swipeable-list) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## About
Swipeable Material-UI list component for React. Before installing keep the following in mind:

- Only use one of these on a page! This component assumes that only one is running. **Running multiple instances will break your app**.
- This component will only work on devices with touch screens (touch events)
- While this component aims to run at 60fps, it can become less performant with big lists.
- This component will, by default, only animate up to eight elements to keep the animation performant. Other elements will just snap into place.
- This components registers touch event listeners on the entire document. This means that, on start, the code needs to traverse the event path. By default this component stops after ten elements.

## Install

```bash
npm install --save material-swipeable-list
```

## Usage

```jsx
import { ListItem, ListItemText } from '@material-ui/core';
import SwipeableList from 'material-swipeable-list';
import React, { useState } from 'react';

const Example = () => {
  const [items, setItems] = useState(['Material', 'React', 'Swipeable', 'Awesome']);

  const handleChange = (index) => setItems((prevItems) => {
    const itemsCopy = prevItems.slice();

    itemsCopy.splice(index, 1);

    return itemsCopy;
  });

  const generateListItem = (item) => (
    <ListItem button>
      <ListItemText primary={item} />
    </ListItem>
  );

  return <SwipeableList items={items} onChange={handleChange} generateListItem={generateListItem} />;
}
```

### Properties
#### `items`
- **Required**: true
- **Type**: array
- **Description**: Your list items

#### `generateListItem`
- **Required**: true
- **Type**: function
- **Description**: Uses the passed function to generate individual list elements. Requires the function to return a valid React component.

#### `onChange`
- **Required**: true
- **Type**: function
- **Description**: Callback for when an item is swiped away. **Make sure you remove the entry from the list** within this function.

#### `maxAnimationCount`
- **Required**: false
- **Type**: number
- **Default**: 8
- **Description**: The max amount of elements to animate after an item is swiped away

#### `maxSearchDepth`
- **Required**: false
- **Type**: number
- **Default**: 10
- **Description**: The search depth for a list item when an element is touched (on start)

#### `dragBoundary`
- **Required**: false
- **Type**: number
- **Default**: 0.35
- **Description**: Item dismissal threshold ranging from 0 to 1

#### `generateKey`
- **Required**: false
- **Type**: function
- **Description**: Used to generate a key property for React. By default it checks if the item is a string; if so, that is used. If the '_id' key is available on the item, that is used. Otherwise, it tries to call 'toString' on the item.

#### Miscellaneous
All other properties are passed onto the component's list component.

## License

MIT © [Jantje19](https://github.com/Jantje19)
