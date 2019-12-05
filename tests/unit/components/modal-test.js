/* eslint no-magic-numbers:0 */
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import sinon from 'sinon';
import waitFor from 'ember-task-scheduler/utils/wait-for';
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import onTransitionEnd from 'ember-transition-end/utils/on-transition-end';
import { run } from '@ember/runloop';

const { spy } = sinon;

let component, deferred, service;

moduleForComponent('modal', 'Unit | Component | modal', {
	needs: ['service:modal', 'service:scheduler', 'model:modal'],

	beforeEach() {
		deferred = RSVP.defer();

		component = this.subject({
			target: null,
			model: EmberObject.create({
				fullname: 'modal-foo',
				deferred,
				promise: deferred.promise
			}),
			modal: {
				content: A()
			}
		});

		service = this.container.lookup('service:scheduler');
	}
});

function waitForTransitionEnd(element) {
	return new RSVP.Promise((resolve) => {
		onTransitionEnd(element, resolve);
	});
}

function waitForTimeout(timeout) {
	return new RSVP.Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

function waitForScheduler() {
	return waitFor(() => !service.hasPendingTasks() && !run.hasScheduledTimers(), 0);
}

test('it hides and removes modal when promise is resolved', async function(assert) {
	this.render();

	await waitForScheduler();

	assert.equal(component.get('visible'), true);

	run(() => {
		deferred.resolve();
	});

	assert.equal(component.get('visible'), false);

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it hides and removes modal when promise is rejected', async function(assert) {
	this.render();

	await waitForScheduler();

	assert.equal(component.get('visible'), true);

	run(() => {
		deferred.reject();
	});

	assert.equal(component.get('visible'), false);

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it sends didOpen when it is rendered', async function(assert) {
	spy(component, 'didOpen');

	this.render();

	await waitForScheduler();

	assert.ok(component.didOpen.calledOnce);
});

test('it sends didOpen when it is rendered and has transitions', async function(assert) {
	spy(component, 'didOpen');

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitForScheduler();

	assert.ok(component.didOpen.notCalled);

	await waitForTimeout(300);

	assert.ok(component.didOpen.calledOnce);
});

test('it does not sends didOpen when it is destroyed', async function(assert) {
	spy(component, 'didOpen');

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitForTransitionEnd(component.element);

	run(component, 'destroy');

	await waitForScheduler();

	assert.ok(component.didOpen.notCalled);
});

test('it waits for transitions before being removed', async function(assert) {
	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitForScheduler();

	run(() => {
		deferred.resolve();
	});

	assert.equal(component.get('visible'), false);

	await waitForTimeout(300);

	assert.notOk(component.get('modal.content').includes(component.get('model')));
});

test('it resolves promise with arguments', async function(assert) {
	assert.expect(1);

	this.render();

	await waitForScheduler();

	component.get('model.promise').then((foo) => {
		assert.equal(foo, 'foo');
	});

	component.resolve('foo');
});

test('it rejects promise with arguments', async function(assert) {
	assert.expect(1);

	this.render();

	await waitForScheduler();

	component.get('model.promise').then(null, (foo) => {
		assert.equal(foo, 'foo');
	});

	component.reject('foo');
});

test('it binds visible class from component', async function(assert) {
	this.render();

	await waitForScheduler();

	run(component, 'set', 'visible', false);

	assert.ok(component.$().attr('data-modal-show') === 'false');

	run(component, 'set', 'visible', true);

	assert.ok(component.$().attr('data-modal-show') === 'true');
});

test('it defines the appropriate `data-id` on the component wrapper', async function(assert) {
	this.render();

	await waitForScheduler();

	assert.equal(component.$().attr('data-id'), 'modalFoo');
});

