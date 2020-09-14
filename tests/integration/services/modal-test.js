/* eslint-disable no-magic-numbers */
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';
import { waitUntil } from '@ember/test-helpers';
import ModalComponent from 'ember-modal-service/components/modal';
import { render } from '@ember/test-helpers';

let service, scheduler;
const ANIMATION_DELAY = 300;

function find(query) {
	return document.querySelectorAll(query);
}

function waitForScheduler() {
	return waitUntil(() => !scheduler.hasPendingTasks() && !run.hasScheduledTimers(), { timeout: 2000 });
}

function waitForTimeout(timeout) {
	return new RSVP.Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
}

module('Integration | Service | modal', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(async function() {
		class ModalFoo extends ModalComponent {
			classNames = ['animated']
		}

		// Registry dummy animated modal.
		this.owner.register('component:modal-foo', ModalFoo);

		class ModalBar extends ModalComponent {}

		// Registry dummy modal.
		this.owner.register('component:modal-bar', ModalBar);

		// Get instance of service.
		service = this.owner.lookup('service:modal');
		scheduler = this.owner.lookup('service:scheduler');

		// Render controller.
		await render(hbs `{{modal-container}}`);
	});

	hooks.afterEach(function() {
		this.owner.unregister('component:modal-foo');
	});

	test('it has an empty array on init', (assert) => {
		assert.ok(isArray(service.get('content')));
		assert.ok(isEmpty(service.get('content')));
	});

	test('it renders, resolves and closes new modal', async(assert) => {
		let $element;

		run(async() => {
			const bar = await service.open('bar');

			assert.equal(bar, 'bar');
		});

		await waitForScheduler();

		$element = find('[data-id="modalBar"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		run(service.get('content.0.deferred'), 'resolve', 'bar');

		$element = find('[data-id="modalBar"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, resolves and closes new modal with transitions', async(assert) => {
		assert.expect(4);

		let $element;

		run(async() => {
			const foo = await service.open('foo');

			assert.equal(foo, 'foo');
		});

		await waitForScheduler();

		$element = find('[data-id="modalFoo"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		await waitForTimeout(ANIMATION_DELAY);

		run(service.get('content.0.deferred'), 'resolve', 'foo');

		$element = find('[data-id="modalFoo"]:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');

		await waitForTimeout(ANIMATION_DELAY);

		$element = find('[data-id="modalFoo"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, rejects and closes new modal', async(assert) => {
		let $element;

		run(async() => {
			try {
				await service.open('bar');
			} catch (error) {
				assert.equal(error, 'bar');
			}
		});

		await waitForScheduler();

		$element = find('[data-id="modalBar"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		run(service.get('content.0.deferred'), 'reject', 'bar');

		$element = find('[data-id="modalBar"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, rejects and closes new modal with transitions', async(assert) => {
		assert.expect(4);

		let $element;

		run(async() => {
			try {
				await service.open('foo');
			} catch (error) {
				assert.equal(error, 'foo');
			}
		});

		await waitForScheduler();

		$element = find('[data-id="modalFoo"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		await waitForTimeout(ANIMATION_DELAY);

		run(service.get('content.0.deferred'), 'reject', 'foo');

		$element = find('[data-id="modalFoo"]:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');

		await waitForTimeout(ANIMATION_DELAY);

		$element = find('[data-id="modalFoo"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, rejects and closes new modal from service', async(assert) => {
		let $element;

		run(async() => {
			try {
				await service.open('bar');
			} catch (error) {
				assert.ok(true);
			}
		});

		await waitForScheduler();

		$element = find('[data-id="modalBar"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		run(service, 'close', 'name', 'bar');

		$element = find('[data-id="modalBar"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, rejects and closes new modal from service with transitions', async(assert) => {
		assert.expect(4);

		let $element;

		run(async() => {
			try {
				await service.open('foo');
			} catch (error) {
				assert.ok(true);
			}
		});

		await waitForScheduler();

		$element = find('[data-id="modalFoo"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		await waitForTimeout(ANIMATION_DELAY);

		run(service, 'close', 'name', 'foo');

		$element = find('[data-id="modalFoo"]:not([data-modal-show="true"])');

		assert.equal($element.length, 1, 'Modal is hidden');

		await waitForTimeout(ANIMATION_DELAY);

		$element = find('[data-id="modalFoo"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});
});
