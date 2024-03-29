import { module, test } from 'qunit';
import { click, render, settled, waitFor } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import cases from 'qunit-parameterize';

module('Acceptance | modal-component', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(async function(assert) {
		assert.timeout(5000);

		this.modal = this.owner.lookup('service:modal');
		this.open = () => this.modal.open('custom-modal');
		this.waitForRender = () => waitFor('[data-id="modalCustomModal"]');
		this.waitForVisible = async() => {
			await settled();
			await waitFor(
				'[data-id="modalCustomModal"][data-modal-show="true"]'
			);
		};

		await render(hbs`<ModalContainer />`);
	});

	test('it defines the appropriate `data-id` on the component wrapper', async function(assert) {
		this.open();

		await this.waitForRender();

		assert.dom('[data-id="modalCustomModal"]').exists();

		await settled();
	});

	test('it is accessible', async function(assert) {
		this.open();

		await this.waitForRender();

		assert
			.dom('[data-id="modalCustomModal"]')
			.hasAttribute('role', 'dialog');

		// Resolve modal to remove pending waiters
		await click('[data-id="resolve"]');
	});

	test('it renders hidden and then toggles visibility', async function(assert) {
		this.open();

		await this.waitForRender();

		assert
			.dom('[data-id="modalCustomModal"]')
			.hasAttribute('data-modal-show', 'false');

		await this.waitForVisible();

		assert
			.dom('[data-id="modalCustomModal"]')
			.hasAttribute('data-modal-show', 'true');
	});

	cases([{ title: 'resolve' }, { title: 'reject' }]).test(
		'it changes visibility when modal is closing ',
		async function({ title: method }, assert) {
			this.open();

			await this.waitForVisible();
			click(`[data-id="${method}"]`);
			await waitFor(
				'[data-id="modalCustomModal"][data-modal-show="false"]'
			);

			assert
				.dom('[data-id="modalCustomModal"]')
				.hasAttribute('data-modal-show', 'false');

			await settled();
		}
	);

	cases([{ title: 'resolve' }, { title: 'reject' }]).test(
		'it removes modal from DOM when promise is fulfilled ',
		async function({ title: method }, assert) {
			const promise = this.open();

			await this.waitForVisible();
			click(`[data-id="${method}"]`);

			try {
				await promise;
			} catch {
				// Nope...
			}

			assert.dom('[data-id="modalCustomModal"]').doesNotExist();
		}
	);

	test(
		'it removes modal from DOM when it\'s closed by the service ',
		async function(assert) {
			const promise = this.open();

			await this.waitForVisible();
			this.modal.close('name', 'custom-modal');

			try {
				await promise;
			} catch {
				// Nope...
			}

			await settled();

			assert.dom('[data-id="modalCustomModal"]').doesNotExist();
		}
	);

	cases([{ title: 'resolve' }, { title: 'reject' }]).test(
		'it fulfills with a value ',
		async function({ title: method }, assert) {
			const promise = this.open();

			await this.waitForVisible();
			click(`[data-id="${method}"]`);

			try {
				const value = await promise;

				assert.equal(typeof value, 'function');
			} catch (e) {
				assert.equal(e, 'reject');
			}
		}
	);

	test('it calls "didOpen" when modal is visible', async function(assert) {
		const promise = this.open();

		await this.waitForVisible();
		await new Promise((res) => setTimeout(res, 500)); // wait transition callback
		click('[data-id="resolve"]');

		const didOpenSpy = await promise;

		assert.ok(didOpenSpy.calledOnce);
	});

	module('animations disabled', (moduleHooks) => {
		moduleHooks.beforeEach(function() {
			this.styles = document.createElement('style');
			this.styles.innerHTML = `
        [data-id="modalCustomModal"] {
            transition: none !important;
        }
        `;
			document.body.appendChild(this.styles);
		});

		moduleHooks.afterEach(function() {
			document.body.removeChild(this.styles);
		});

		test('it calls "didOpen" when modal is visible', async function(assert) {
			const promise = this.open();

			await this.waitForVisible();
			await new Promise((res) => setTimeout(res, 500)); // wait transition callback
			click('[data-id="resolve"]');

			const didOpenSpy = await promise;

			assert.ok(didOpenSpy.calledOnce);
		});

		cases([{ title: 'resolve' }, { title: 'reject' }]).test(
			'it removes modal from DOM when promise is fulfilled ',
			async function({ title: method }, assert) {
				const promise = this.open();

				await this.waitForVisible();
				click(`[data-id="${method}"]`);

				try {
					await promise;
				} catch {
					// Nope...
				}

				assert.dom('[data-id="modalCustomModal"]').doesNotExist();
			}
		);
	});
});
