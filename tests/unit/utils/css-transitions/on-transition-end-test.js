/* eslint no-magic-numbers:0 */
import { module, test } from 'qunit';
import onTransitionEnd from 'dummy/utils/css-transitions/on-transition-end';
import sinon from 'sinon';
import { createElement, clearScenario, setAnimationStyle } from './helpers';

const { spy } = sinon;

module('Unit | Util | css-transitions | on-transition-end', {
	afterEach() {
		clearScenario();
	}
});

test('it waits for any element transition', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'all .5s linear 0s';

	onTransitionEnd(element, fn);

	setAnimationStyle(element, 'opacity', '0.5');

	setTimeout(() => {
		assert.ok(fn.notCalled, 'fn is not called');
	}, 250);

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');
		done();
	}, 600);
});

test('it waits for any element transition several times', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'all .2s linear 0s';

	onTransitionEnd(element, fn);

	setAnimationStyle(element, 'opacity', '0.5');

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');

		setAnimationStyle(element, 'background-color', 'green');
	}, 300);

	setTimeout(() => {
		assert.ok(fn.calledTwice, 'fn is called twice');
		done();
	}, 600);
});

test('it calls function with transition event', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'all .25s linear 0s';

	onTransitionEnd(element, fn);

	setAnimationStyle(element, 'opacity', '0.5');

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');
		assert.ok(fn.args[0][0] instanceof Event, 'fn is called with event');
		done();
	}, 300);
});

test('it waits for selected element transition', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'background-color .2s linear 0s';

	onTransitionEnd(element, fn, 'background-color');

	setAnimationStyle(element, 'opacity', '0.5');

	setTimeout(() => {
		assert.ok(fn.notCalled, 'fn is not called');

		setAnimationStyle(element, 'backgroundColor', 'green');
	}, 300);

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');
		done();
	}, 600);
});

test('it waits for selected element transition with several transitions', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'opacity .2s linear 0s, background-color .4s linear 0s';

	onTransitionEnd(element, fn, 'background-color');

	setAnimationStyle(element, 'opacity', '0.5');
	setAnimationStyle(element, 'backgroundColor', 'green');

	setTimeout(() => {
		assert.ok(fn.notCalled, 'fn is not called');
	}, 300);

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');
		done();
	}, 500);
});


test('it waits for any element transition once', (assert) => {
	const done = assert.async();
	const element = createElement();
	const fn = spy();

	element.style.transition = 'background-color .2s linear 0s';

	onTransitionEnd(element, fn, 'background-color', true);

	setAnimationStyle(element, 'backgroundColor', 'green');

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is called once');

		setAnimationStyle(element, 'backgroundColor', 'red');
	}, 300);

	setTimeout(() => {
		assert.ok(fn.calledOnce, 'fn is still called once');
		done();
	}, 600);
});
