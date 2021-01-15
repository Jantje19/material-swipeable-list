import { ListItem, ListItemText } from '@material-ui/core';
import React, { useState } from 'react';

import SwipeableList from 'material-swipeable-list';

const App = () => {
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

export default App;
