import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import cases from 'qunit-parameterize';
import sinon from 'sinon';

module('Integration | Helper | open-modal', (hooks) => {
	setupRenderingTest(hooks);

	hooks.beforeEach(function() {
		this.sandbox = sinon.createSandbox();
	});

	hooks.afterEach(function() {
		this.sandbox.restore();
	});

	test('service modal is called without optional parameters', async function(assert) {
		const mockedService = Ember.Service.extend({
			open: this.sandbox.stub().resolves()
		});

		this.owner.register('service:modal', mockedService);

		const service = this.owner.lookup('service:modal');

		assert.ok(service.open.notCalled);

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo'}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();

		assert.ok(service.open.calledOnceWith('foo'));
	});

	test('it handles the service reject response', async function(assert) {
		const done = assert.async();

		const mockedService = Ember.Service.extend({
			open: this.sandbox.stub().rejects(new Error('Error'))
		});

		this.owner.register('service:modal', mockedService);

		this.onFail = (error) => {
			assert.ok(error instanceof Error, 'it handles the rejection');
			assert.equal(error.message, 'Error', 'it handles the rejection');
			done();
		};

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' onFail=onFail}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();
	});

	test('it handles the service resolve response', async function(assert) {
		const done = assert.async();

		const mockedService = Ember.Service.extend({
			open: this.sandbox.stub().resolves('Service called')
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
		const mockedService = Ember.Service.extend({
			open: this.sandbox.stub().resolves()
		});

		this.owner.register('service:modal', mockedService);

		const service = this.owner.lookup('service:modal');

		this.onDone = () => {};
		this.onFail = () => {};

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' onDone=onDone onFail=onFail}}></div>`);

		const element = find('[data-id="foo"]');

		await element.click();

		assert.ok(service.open.calledOnceWith('foo'));
	});

	cases([
		{ title:'onDone(Func) onFail(String)', onDone: () => {}, onFail: 'I am a String' },
		{ title:'onDone(Array) onFail(Bool)', onDone: [], onFail: true },
		{ title:'onDone(null) onFail(Func)', onDone: null, onFail: () => {} }
	]).test('it works with the optional parameters', async function(params, assert) {
		const mockedService = Ember.Service.extend({
			open: this.sandbox.stub().resolves()
		});

		this.owner.register('service:modal', mockedService);

		const service = this.owner.lookup('service:modal');

		this.set('params', params);

		await render(hbs`<div data-id='foo' onClick={{open-modal 'foo' params.onDone params.onFail}}></div>`);

		const element = find('[data-id="foo"]');

		assert.ok(service.open.notCalled);

		await element.click();

		assert.ok(service.open.calledOnceWith('foo'));
	});
});
