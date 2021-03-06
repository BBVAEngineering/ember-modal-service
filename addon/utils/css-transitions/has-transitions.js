export default function hasTransitions(element) {
	const { transitionProperty, transitionDuration } = window.getComputedStyle(element);
	const hasNoDurations = transitionDuration.split(', ').every((duration) => duration === '0s');

	return !(hasNoDurations || transitionProperty === 'all' && transitionDuration === '0s');
}
