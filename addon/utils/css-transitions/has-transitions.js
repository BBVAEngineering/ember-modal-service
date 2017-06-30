/**
 * Returns whether an element has CSS transitions applied directly on itself.
 *
 * @method hasTransitions
 * @param {Element} element
 * @return Boolean
 */
export default function hasTransitions(element) {
	const { transitionProperty, transitionDuration } = window.getComputedStyle(element);

	return !(transitionProperty === 'all' && transitionDuration === '0s');
}
