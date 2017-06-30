/* eslint-disable no-magic-numbers */
import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import ModalComponent from 'ember-modal-service/components/modal';
import hbs from 'htmlbars-inline-precompile';

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
	return Ember.$(query);
}

test('it renders, resolves and closes new modal', (assert) => {
	let $element;

	run(() => {
		service.open('bar').then((bar) => {
			assert.equal(bar, 'bar');
		});
	});

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'resolve', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, resolves and closes new modal with transitions', (assert) => {
	assert.expect(4);

	const done = assert.async();

	let $element;

	run(() => {
		service.open('foo').then((foo) => {
			assert.equal(foo, 'foo');
		});
	});

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	setTimeout(() => {
		run(service.get('content.0.deferred'), 'resolve', 'foo');

		$element = find('#foo:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');
	}, 300);

	setTimeout(() => {
		$element = find('#foo');

		assert.equal($element.length, 0, 'Modal is removed from DOM');

		done();
	}, 600);
});

test('it renders, rejects and closes new modal', (assert) => {
	let $element;

	run(() => {
		service.open('bar').then(null, (bar) => {
			assert.equal(bar, 'bar');
		});
	});

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service.get('content.0.deferred'), 'reject', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal with transitions', (assert) => {
	assert.expect(4);

	const done = assert.async();

	let $element;

	run(() => {
		service.open('foo').then(null, (foo) => {
			assert.equal(foo, 'foo');
		});
	});

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	setTimeout(() => {
		run(service.get('content.0.deferred'), 'reject', 'foo');

		$element = find('#foo:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');
	}, 300);

	setTimeout(() => {
		$element = find('#foo');

		assert.equal($element.length, 0, 'Modal is removed from DOM');

		done();
	}, 600);
});

test('it renders, rejects and closes new modal from service', (assert) => {
	let $element;

	run(() => {
		service.open('bar').then(null, () => {
			assert.ok(true);
		});
	});

	$element = find('#bar[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	run(service, 'close', 'name', 'bar');

	$element = find('#bar');

	assert.equal($element.length, 0, 'Modal is removed from DOM');
});

test('it renders, rejects and closes new modal from service with transitions', (assert) => {
	assert.expect(4);

	const done = assert.async();

	let $element;

	run(() => {
		service.open('foo').then(null, () => {
			assert.ok(true);
		});
	});

	$element = find('#foo[data-modal-show="true"]');

	assert.equal($element.length, 1, 'Modal is displayed');

	setTimeout(() => {
		run(service, 'close', 'name', 'foo');

		$element = find('#foo:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');
	}, 300);

	setTimeout(() => {
		$element = find('#foo');

		assert.equal($element.length, 0, 'Modal is removed from DOM');

		done();
	}, 600);
});
