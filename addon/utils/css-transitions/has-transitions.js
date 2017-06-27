export default function hasTransitions(element) {
	const { transitionProperty, transitionDuration } = window.getComputedStyle(element);

	return !(transitionProperty === 'all' && transitionDuration === '0s');
}
