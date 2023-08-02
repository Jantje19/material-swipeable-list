export default ({
	maxAnimationCount,
	onChange,
	maxSearchDepth,
	dragBoundary,
}: {
	maxAnimationCount: number;
	onChange: (index: number) => void;
	maxSearchDepth: number;
	dragBoundary: number;
}) => {
	let draggingCard = false;
	let isAnimating = false;
	let containerBCR: DOMRect | null = null;
	let targetBCR: DOMRect | null = null;
	let target: HTMLElement | null = null;
	let currentX = 0;
	let screenX = 0;
	let targetX = 0;
	let startX = 0;

	const update = () => {
		if (isAnimating) {
			requestAnimationFrame(update);
		}

		if (!target || !targetBCR || !containerBCR) {
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
		target.style.opacity = opacity.toString();

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
					if (target.parentElement?.style) {
						target.parentElement.style.height = '';
					}
				} else {
					// Animates most off/all the items below the dismissed item
					(function nextSibling(elem: Element | null, index = 0) {
						if (elem && index < maxAnimationCount) {
							const onTransitionEnd = () => {
								if (elem instanceof HTMLElement) {
									elem.style.transition = 'none';
								}

								elem.removeEventListener('transitionend', onTransitionEnd);

								if (elem.parentElement) {
									elem.parentElement.style.height = '';
								}
							};

							// TODO: Replace this once Safari gets WebAnimations.onfinish support
							if (elem instanceof HTMLElement) {
								elem.style.transform = `translateY(${targetBCR.height}px)`;

								requestAnimationFrame(() => {
									elem.style.transform = 'none';
									elem.style.transition =
										'transform .15s cubic-bezier(0, 0, 0.31, 1)';
								});
							}

							elem.addEventListener('transitionend', onTransitionEnd);
							nextSibling(elem.nextElementSibling, index + 1);
						}
					})(target.nextElementSibling);

					if (target.parentElement) {
						target.parentElement.style.height = `${containerBCR.height}px`;
					}
				}

				const index = parseInt(
					target.getAttribute('data-listitem-index') || '-1',
					10
				);

				target.style.display = 'none';
				target = null;

				if (!Number.isNaN(index) && index >= 0) {
					onChange(index);
				}
			}

			if (isNearlyAtStart && target) {
				target.style.willChange = 'initial';
				target.style.transform = 'none';
				target = null;
			}
		}
	};

	const onStart = (evt: TouchEvent) => {
		if (target) {
			return;
		}

		// TODO: Replace with elem.closest (if it is more performant...)
		const elemTarget = (() => {
			// @ts-expect-error: Missing types
			const path: EventTarget[] = evt.path ?? evt.composedPath();
			const searchDepth = Math.min(path.length, maxSearchDepth);

			for (let i = 0; i < searchDepth; i++) {
				const elem = path[i];

				if (elem === document) {
					break;
				}

				if (
					elem instanceof HTMLElement &&
					elem.hasAttribute('data-listitem-index')
				) {
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
		containerBCR = target.parentElement?.getBoundingClientRect() ?? null;
		draggingCard = true;
		// @ts-expect-error: Missing types
		startX = evt.pageX ?? evt.touches[0].pageX;
		currentX = startX;

		// TODO: Pre-promote all items that are visible
		target.style.willChange = 'transform, opacity';

		if (!isAnimating) {
			isAnimating = true;
			requestAnimationFrame(update);
		}
	};

	const onMove = (evt: TouchEvent) => {
		if (!target) {
			return;
		}

		// @ts-expect-error: Missing types
		currentX = evt.pageX ?? evt.touches[0].pageX;
	};

	const onEnd = () => {
		if (!target) {
			return;
		}

		targetX = 0;

		const localScreenX = currentX - startX;

		if (targetBCR && Math.abs(localScreenX) > targetBCR.width * dragBoundary) {
			targetX = localScreenX > 0 ? targetBCR.width : -targetBCR.width;
		}

		draggingCard = false;
	};

	return { onStart, onMove, onEnd };
};
