import hasTransitions from 'dummy/utils/css-transitions/has-transitions';
import { module, test } from 'qunit';
import { createElement, clearScenario } from './helpers';

module('Unit | Util | css-transitions | has-transitions', {
	afterEach() {
		clearScenario();
	}
});

test('it returns true when element has any transition', (assert) => {
	const element = createElement();

	element.style.transition = 'all .5s linear 0s';

	assert.ok(hasTransitions(element), 'element has transitions');
});

test('it returns true when element has a transition', (assert) => {
	const element = createElement();

	element.style.transition = 'opacity .5s linear 0s';

	assert.ok(hasTransitions(element), 'element has transitions');
});

test('it returns true when element has several transitions', (assert) => {
	const element = createElement();

	element.style.transition = 'opacity .5s linear 0s, background-color 1s linear 0s';

	assert.ok(hasTransitions(element), 'element has transitions');
});

test('it returns false when element has no transitions', (assert) => {
	const element = createElement();

	assert.notOk(hasTransitions(element), 'element has no transitions');
});
