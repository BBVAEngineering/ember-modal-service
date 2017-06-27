import Ember from 'ember';

const { run } = Ember;

const div = document.createElement('div');
const eventNames = {
	transition:       'transitionend',
	MozTransition:    'transitionend',
	OTransition:      'oTransitionEnd',
	WebkitTransition: 'webkitTransitionEnd',
	msTransition:     'MSTransitionEnd'
};

function findTransitionEventName() {
	const key = Object.keys(eventNames).find((eventName) => eventName in div.style);

	return eventNames[key];
}

const transitionEndEventName = findTransitionEventName();

export default function onTransitionEnd(element, callback, transitionProperty = 'all', once = false) {
	const fn = (e) => {
		const { propertyName, type } = e;

		if (transitionProperty !== 'all' && propertyName !== transitionProperty) {
			return;
		}

		if (once) {
			element.removeEventListener(type, fn, true);
		}

		run(null, callback, e);
	};

	element.addEventListener(transitionEndEventName, fn, true);
}
