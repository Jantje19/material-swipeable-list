import { useState, useCallback, useMemo } from 'react';
import SwipeableList from 'material-swipeable-list';
import { makeStyles } from 'tss-react/mui';
import {
	Button,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
} from '@mui/material';

const list = ['Material', 'React', 'Swipeable', 'Awesome'];

const useStyles = makeStyles()(({ spacing }) => ({
	empty: {
		marginTop: spacing(2),
		textAlign: 'center',

		'&>i': {
			display: 'block',
		},
	},
}));

const App = () => {
	const [items, setItems] = useState(list);
	const { classes } = useStyles();

	const isTouchDevice = useMemo(() => navigator.maxTouchPoints > 0, []);

	const handleChange = useCallback(
		(index: number) =>
			setItems((prevItems) => {
				const itemsCopy = prevItems.slice();

				itemsCopy.splice(index, 1);

				return itemsCopy;
			}),
		[]
	);

	if (items.length < 1) {
		return (
			<div className={classes.empty}>
				<Typography component="i" gutterBottom>
					List is empty
				</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={() => setItems(list)}
				>
					Reset
				</Button>
			</div>
		);
	}

	return (
		<>
			{!isTouchDevice && (
				<Typography color="error" gutterBottom>
					Your device does not generate touch events. Use a device with a touch
					screen or open the Device Toolbar in a desktop browser.
				</Typography>
			)}
			<SwipeableList items={items} onChange={handleChange}>
				{(item) => (
					<ListItem>
						<ListItemButton>
							<ListItemText primary={item} />
						</ListItemButton>
					</ListItem>
				)}
			</SwipeableList>
		</>
	);
};

export default App;
