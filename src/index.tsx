import { CSSProperties, ReactNode, useEffect, useMemo } from 'react';
import { List } from '@mui/material';

import eventHandlers from './eventHandlers';

export type BaseItem = string | ({ _id?: string } & Record<string, unknown>);

type GenerateListItem<Item extends BaseItem = BaseItem> = (
	item: Item,
	index: number,
	array: Item[]
) => ReactNode;

export type SwipeableListProps<Item extends BaseItem = BaseItem> = {
	maxAnimationCount?: number;
	maxSearchDepth?: number;
	dragBoundary?: number;
	// TODO: Use proper definition
	component?: typeof List;
	style?: CSSProperties;
	onChange: (index: number) => void;
	items: Item[];
	generateKey?: (item: Item) => string;
} & (
	| {
			children: GenerateListItem<Item>;
			generateListItem?: GenerateListItem<Item>;
	  }
	| { generateListItem: GenerateListItem<Item>; children?: undefined }
);

const generateSimpleKey = <Item extends BaseItem = BaseItem>(item: Item) => {
	if (typeof item === 'string') {
		return item;
	}

	if (item._id) {
		return item._id;
	}

	return item.toString();
};

const SwipeableList = <Item extends BaseItem = BaseItem>({
	items,
	generateListItem,
	children,
	onChange,
	maxAnimationCount = 8, // The max amount of elements to animate
	maxSearchDepth = 10, // The search depth for a list item when an element is touched (on start)
	dragBoundary = 0.35, // Item dismissal threshold
	component: Component = List,
	style = {},
	generateKey = generateSimpleKey,
	...props
}: SwipeableListProps<Item>) => {
	const { onStart, onMove, onEnd } = useMemo(
		() =>
			eventHandlers({
				maxAnimationCount,
				maxSearchDepth,
				dragBoundary,
				onChange,
			}),
		[maxAnimationCount, onChange, maxSearchDepth, dragBoundary]
	);

	const getListItem = useMemo(
		() => children ?? generateListItem,
		[children, generateListItem]
	);

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
		<Component style={{ overflowX: 'hidden', ...style }} {...props}>
			{items.map((...args) => {
				const listItem = getListItem(...args);
				const [item, index] = args;

				return (
					<div data-listitem-index={index} key={generateKey(item)}>
						{listItem}
					</div>
				);
			})}
		</Component>
	);
};

export default SwipeableList;
