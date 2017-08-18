/* eslint-disable no-magic-numbers */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import ModalComponent from 'ember-modal-service/components/modal';
import hbs from 'htmlbars-inline-precompile';
import waitFor from 'ember-task-scheduler/utils/wait-for';

const { run, RSVP } = Ember;

let service, scheduler;

moduleForComponent('modal-container', 'Integration | Service | modal', {
	integration: true,
	beforeEach() {
		// Registry dummy animated modal.
		this.registry.register('component:modal-foo', ModalComponent.extend({
			id: 'foo',
			attributeBindings: ['id'],
			classNames: ['animated']
		}));

		// Registry dummy modal.
		this.registry.register('component:modal-bar', ModalComponent.extend({
			id: 'bar',
			attributeBindings: ['id']
		}));

		// Get instance of service.
		service = this.container.lookup('service:modal');
		scheduler = this.container.lookup('service:scheduler');

		// Render controller.
		this.render(hbs `{{modal-container}}`);
	},
	afterEach() {
		this.registry.unregister('component:modal-foo');
	}
});

function find(query) {
	return Ember.$(query);
}

function waitForScheduler() {
	return waitFor(() => !scheduler.hasPendingTasks() && !run.hasScheduledTimers(), 0);
}

function waitForTimeout(timeout) {
	return new RSVP.Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

test('it renders, resolves and closes new modal', async (assert) => {
	let $element;

	run(() => {
		service.open('bar').then((bar) => {
			assert.equal(bar, 'bar');
		});
	});

	await waitForScheduler();

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'resolve', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, resolves and closes new modal with transitions', async (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then((foo) => {
			assert.equal(foo, 'foo');
		});
	});

	await waitForScheduler();

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	await waitForTimeout(300);

	run(service.get('content.0.deferred'), 'resolve', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	await waitForTimeout(300);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal', async (assert) => {
	let $element;

	run(() => {
		service.open('bar').then(null, (bar) => {
			assert.equal(bar, 'bar');
		});
	});

	await waitForScheduler();

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'reject', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal with transitions', async (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then(null, (foo) => {
			assert.equal(foo, 'foo');
		});
	});

	await waitForScheduler();

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	await waitForTimeout(300);

	run(service.get('content.0.deferred'), 'reject', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	await waitForTimeout(300);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal from service', async (assert) => {
	let $element;

	run(() => {
		service.open('bar').then(null, () => {
			assert.ok(true);
		});
	});

	await waitForScheduler();

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service, 'close', 'name', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal from service with transitions', async (assert) => {
	assert.expect(4);

	let $element;

	run(() => {
		service.open('foo').then(null, () => {
			assert.ok(true);
		});
	});

	await waitForScheduler();

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	await waitForTimeout(300);

	run(service, 'close', 'name', 'foo');

	$element = find('#foo:not([data-modal-show="true"])');

	assert.equal($element.length, 1, 'Modal is hidden');

	await waitForTimeout(300);

	$element = find('#foo');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});
