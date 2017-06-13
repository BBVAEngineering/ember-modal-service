/* eslint-disable no-magic-numbers, max-statements */
import Ember from 'ember';
import { module, test } from 'qunit';
import sinon from 'sinon';
import wait from '../helpers/wait';

module('Unit | Helper | wait');

test('it runs next scheduled timer', (assert) => {
	const func1 = sinon.spy();
	const func2 = sinon.spy();

	wait();

	Ember.run.later(func1);
	Ember.run.later(func2, 1200);

	assert.notOk(func1.calledOnce);
	assert.notOk(func2.calledOnce);

	wait();

	assert.ok(func1.calledOnce);
	assert.notOk(func2.calledOnce);

	wait();

	assert.ok(func1.calledOnce);
	assert.ok(func2.calledOnce);
});

test('it runs scheduled timers when count is passed', (assert) => {
	const func1 = sinon.spy();
	const func2 = sinon.spy();
	const func3 = sinon.spy();

	Ember.run.later(func1, 600);
	Ember.run.later(func2, 1200);
	Ember.run.later(func3, 1800);

	assert.notOk(func1.calledOnce, 'At start, func1 is not called');
	assert.notOk(func2.calledOnce, 'At start, func2 is not called');
	assert.notOk(func3.calledOnce, 'At start, func3 is not called');

	wait(600);

	assert.ok(func1.calledOnce, 'At 600ms, func1 is called');
	assert.notOk(func2.calledOnce, 'At 600ms, func2 not is called');
	assert.notOk(func3.calledOnce, 'At 600ms, func3 not is called');

	wait();

	assert.ok(func1.calledOnce, 'At 1200ms, func1 is called');
	assert.ok(func2.calledOnce, 'At 1200ms, func2 is called');
	assert.notOk(func3.calledOnce, 'At 1200ms, func3 not is called');

	wait(600);

	assert.ok(func1.calledOnce, 'At 1800ms, func1 is called');
	assert.ok(func2.calledOnce, 'At 1800ms, func2 is called');
	assert.ok(func3.calledOnce, 'At 1800ms, func2 is called');
});

test('it runs chained timers', (assert) => {
	const funcs = {
		func1() {
			Ember.run.later(funcs.func2, 600);
		},
		func2() {}
	};

	sinon.spy(funcs, 'func1');
	sinon.spy(funcs, 'func2');

	Ember.run.later(funcs.func1, 600);

	assert.notOk(funcs.func1.calledOnce);
	assert.notOk(funcs.func2.calledOnce);

	wait(600);

	assert.ok(funcs.func1.calledOnce);
	assert.notOk(funcs.func2.calledOnce);

	wait(600);

	assert.ok(funcs.func1.calledOnce);
	assert.ok(funcs.func2.calledOnce);
});

test('it runs multiple timers on same slice', (assert) => {
	const func1 = sinon.spy();
	const func2 = sinon.spy();
	const func3 = sinon.spy();
	const func4 = sinon.spy();

	Ember.run.later(func1, 1000);
	Ember.run.later(func2, 1500);
	Ember.run.later(func3, 4000);
	Ember.run.later(func4, 4500);

	wait(2000);

	assert.ok(func1.calledOnce);
	assert.ok(func2.calledOnce);

	wait();

	assert.ok(func3.calledOnce);
	assert.notOk(func4.calledOnce);

	wait();

	assert.ok(func4.calledOnce);
});
