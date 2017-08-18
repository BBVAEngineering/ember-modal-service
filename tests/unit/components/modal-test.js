/* eslint no-magic-numbers:0 */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';
import waitFor from 'ember-task-scheduler/utils/wait-for';

const {
	A,
	run,
	RSVP: { defer }
} = Ember;
const { spy } = sinon;

let component, deferred, service;

moduleForComponent('modal', 'Unit | Component | modal', {
	needs: ['service:modal', 'service:scheduler', 'model:modal'],

	beforeEach() {
		deferred = defer();

		component = this.subject({
			target: null,
			model: Ember.Object.create({
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
	const done = assert.async();

	spy(component, 'didOpen');

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitForScheduler();

	assert.ok(component.didOpen.notCalled);

	setTimeout(() => {
		assert.ok(component.didOpen.calledOnce);
		done();
	}, 300);
});

test('it waits for transitions before being removed', async function(assert) {
	const done = assert.async();

	run(component, 'set', 'classNames', ['animated']);

	this.render();

	await waitForScheduler();

	run(() => {
		deferred.resolve();
	});

	assert.equal(component.get('visible'), false);

	setTimeout(() => {
		assert.notOk(component.get('modal.content').includes(component.get('model')));
		done();
	}, 600);
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

