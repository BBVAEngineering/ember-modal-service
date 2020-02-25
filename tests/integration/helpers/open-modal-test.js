import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import cases from 'qunit-parameterize';

const { RSVP } = Ember;

module('Integration | Helper | open-modal', (hooks) => {
	setupRenderingTest(hooks);

	test('service modal is called without optional parameters', async function(assert) {
		let openModalCalled = false;

		const mockedService = Ember.Service.extend({
			open() {
				openModalCalled = true;
				return new RSVP.Promise(() => {});
			}
		});

		this.owner.register('service:modal', mockedService);

		assert.notOk(openModalCalled);

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo'}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();

		assert.ok(openModalCalled);
	});

	test('it handles the service reject response', async function(assert) {
		const done = assert.async();

		const mockedService = Ember.Service.extend({
			open() {
				return RSVP.reject('Error');
			}
		});

		this.owner.register('service:modal', mockedService);

		this.onFail = (error) => {
			assert.equal(error, 'Error', 'it handles the rejection');
			done();
		};

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' onFail=onFail}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();
	});

	test('it handles the service resolve response', async function(assert) {
		const done = assert.async();

		const mockedService = Ember.Service.extend({
			open() {
				return RSVP.resolve('Service called');
			}
		});

		this.owner.register('service:modal', mockedService);

		this.onDone = (data) => {
			assert.equal(data, 'Service called', 'it returns the right value');
			done();
		};

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' onDone=onDone}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();
	});

	test('it handles the service resolve response with two optional parameters', async function(assert) {

		let openModalCalled = false;

		const mockedService = Ember.Service.extend({
			open() {
				openModalCalled = true;
				return RSVP.resolve('Service called');
			}
		});

		this.owner.register('service:modal', mockedService);

		this.onDone = () => {};
		this.onFail = () => {};

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' onDone=onDone onFail=onFail}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();

		assert.ok(openModalCalled);
	});

	cases([
		{ title:'onDone(Func) onFail(String)', onDone: () => {}, onFail: 'I am a String' },
		{ title:'onDone(Array) onFail(Bool)', onDone: [], onFail: true },
		{ title:'onDone(null) onFail(Func)', onDone: null, onFail: () => {} }
	]).test('it works with the optional parameters', async function(params, assert) {
		let openModalCalled = false;

		const mockedService = Ember.Service.extend({
			open() {
				openModalCalled = true;
				return RSVP.resolve('Service called');
			}
		});

		this.owner.register('service:modal', mockedService);

		this.set('params', params);

		assert.notOk(openModalCalled);

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' params.onDone params.onFail}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();

		assert.ok(openModalCalled);
	});
});
