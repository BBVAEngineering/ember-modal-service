/* eslint-disable no-magic-numbers */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import ModalComponent from 'ember-modal-service/components/modal';
import hbs from 'htmlbars-inline-precompile';
import waitFor from 'ember-task-scheduler/utils/wait-for';

const { run } = Ember;

let service;

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

		// Render controller.
		this.render(hbs `{{modal-container}}`);
	},
	afterEach() {
		this.registry.unregister('component:modal-foo');
	}
});

function find(query) {
	return Ember.$(query).get(0);
}

test('it renders, resolves and closes new modal', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('bar').then((bar) => {
			assert.equal(bar, 'bar');
		});
	});

	await waitFor(() => find('#bar[data-modal-show="true"]'));

	run(service.get('content.0.deferred'), 'resolve', 'bar');

	await waitFor(() => !find('#bar'));
});

test('it renders, resolves and closes new modal with transitions', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('foo').then((foo) => {
			assert.equal(foo, 'foo');
		});
	});

	await waitFor(() => find('#foo[data-modal-show="true"]'));

	run(service.get('content.0.deferred'), 'resolve', 'foo');

	await waitFor(() => find('#foo:not([data-modal-show="true"])'));

	await waitFor(() => !find('#foo'));
});

test('it renders, rejects and closes new modal', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('bar').then(null, (bar) => {
			assert.equal(bar, 'bar');
		});
	});

	await waitFor(() => find('#bar[data-modal-show="true"]'));

	run(service.get('content.0.deferred'), 'reject', 'bar');

	await waitFor(() => !find('#bar'));
});

test('it renders, rejects and closes new modal with transitions', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('foo').then(null, (foo) => {
			assert.equal(foo, 'foo');
		});
	});

	await waitFor(() => find('#foo[data-modal-show="true"]'));

	run(service.get('content.0.deferred'), 'reject', 'foo');

	await waitFor(() => find('#foo:not([data-modal-show="true"])'));

	await waitFor(() => !find('#foo'));
});

test('it renders, rejects and closes new modal from service', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('bar').then(null, () => {
			assert.ok(true);
		});
	});

	await waitFor(() => find('#bar[data-modal-show="true"]'));

	run(service, 'close', 'name', 'bar');

	await waitFor(() => !find('#bar'));
});

test('it renders, rejects and closes new modal from service with transitions', async (assert) => {
	assert.expect(1);

	run(() => {
		service.open('foo').then(null, () => {
			assert.ok(true);
		});
	});

	await waitFor(() => find('#foo[data-modal-show="true"]'));

	run(service, 'close', 'name', 'foo');

	await waitFor(() => find('#foo:not([data-modal-show="true"])'));

	await waitFor(() => !find('#foo'));
});
