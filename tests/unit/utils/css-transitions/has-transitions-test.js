import hasTransitions from 'dummy/utils/css-transitions/has-transitions';
import { module, test } from 'qunit';
import { createElement, clearScenario } from './helpers';

module('Unit | Util | css-transitions | has-transitions', {
	afterEach() {
		clearScenario();
	}
});

test('it returns when element has any transition', (assert) => {
	const element = createElement();

	element.style.transition = 'all .5s linear 0s';

	assert.ok(hasTransitions(element), 'element has transitions');
});
