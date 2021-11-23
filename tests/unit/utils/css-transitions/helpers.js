/* eslint no-magic-numbers:0 */

export function createElement() {
	const element = document.createElement('div');

	element.style.backgroundColor = 'red';
	element.style.opacity = '1';
	element.style.width = '200px';
	element.style.height = '200px';

	document.getElementById('ember-testing').appendChild(element);

	return element;
}

export function clearScenario() {
	const element = document.getElementById('ember-testing');

	while (element.hasChildNodes()) {
		element.removeChild(element.lastChild);
	}
}

export function setAnimationStyle(element, property, value) {
	setTimeout(() => {
		element.style[property] = value;
	}, 25);
}
