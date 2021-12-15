/* eslint-disable no-magic-numbers */
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { run } from '@ember/runloop';
import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';
import ModalComponent from 'ember-modal-service/components/modal';
import {
	click,
	render,
	settled,
	waitFor,
	waitUntil,
} from '@ember/test-helpers';
import cases from 'qunit-parameterize';

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

async function waitForVisible() {
	await settled();
	await waitFor('[data-id="modalCustomModal"][data-modal-show="true"]');
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
		await render(hbs `<ModalContainer/>`);
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

		run(service.get('content.0'), 'resolve', 'bar');

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

		run(service.get('content.0'), 'resolve', 'foo');

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

		run(service.get('content.0'), 'reject', 'bar');

		$element = find('[data-id="modalBar"]');

		assert.equal($element.length, 0, 'Modal is removed from DOM');
	});

	test('it renders, rejects and closes new modal with transitions', async(assert) => {
		assert.expect(3);

		let $element;

		run(async() => {
			try {
				await service.open('foo');
			} catch (error) {
				// Noop
			}
		});

		await waitForScheduler();

		$element = find('[data-id="modalFoo"][data-modal-show="true"]');

		assert.equal($element.length, 1, 'Modal is displayed');

		await waitForTimeout(ANIMATION_DELAY);

		run(service.get('content.0'), 'reject', 'foo');

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
		assert.expect(3);

		let $element;

		run(async() => {
			try {
				await service.open('foo');
			} catch (error) {
				// Noop
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

	test('it triggers event when a modal is open', async(assert) => {
		assert.expect(2);

		const done = assert.async();

		service.one('open', (modal) => {
			assert.ok(1, 'modal is open');
			assert.equal(
				modal.name,
				'foo',
				'modal exists as first argument'
			);

			done();
		});

		run(async() => {
			await service.open('foo');
		});
	});

	cases([{ title: 'resolve' }, { title: 'reject' }]).test(
		'it changes visibility when modal is closing ',
		async({ title: method }, assert) => {
			const promise = service.open('custom-modal');

			await waitForVisible();

			click(`[data-id="${method}"]`);

			try {
				await promise;
			} catch {
				// Nope...
			}

			assert.dom('[data-id="modalCustomModal"]').doesNotExist();
		}
	);

	cases([{ title: 'resolve' }, { title: 'reject' }]).test(
		'it removes modal from DOM when promise is fulfilled ',
		async({ title: method }, assert) => {
			const promise = service.open('custom-modal');

			await waitForVisible();

			await click(`[data-id="${method}"]`);

			try {
				await promise;
			} catch {
				// Nope...
			}

			assert.dom('[data-id="modalCustomModal"]').doesNotExist();
		}
	);
});
