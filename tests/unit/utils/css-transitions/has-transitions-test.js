import hasTransitions from 'ember-modal-service/utils/css-transitions/has-transitions';
import { module, test } from 'qunit';
import { createElement, clearScenario } from './helpers';

module('Unit | Util | css-transitions | has-transitions', (hooks) => {
  hooks.afterEach(() => {
    clearScenario();
  });

  test('it returns true when element has any transition', function (assert) {
    const element = createElement();

    element.style.transition = 'all .5s linear 0s';

    assert.ok(hasTransitions(element), 'element has transitions');
  });

  test('it returns true when element has a transition', function (assert) {
    const element = createElement();

    element.style.transition = 'opacity .5s linear 0s';

    assert.ok(hasTransitions(element), 'element has transitions');
  });

  test('it returns true when element has several transitions', function (assert) {
    const element = createElement();

    element.style.transition =
      'opacity .5s linear 0s, background-color 1s linear 0s';

    assert.ok(hasTransitions(element), 'element has transitions');
  });

  test('it returns false when element has no transitions', function (assert) {
    const element = createElement();

    assert.notOk(hasTransitions(element), 'element has no transitions');
  });

  test('it returns false when element has no durations', function (assert) {
    const element = createElement();

    element.style.transition =
      'transform 0s linear 0s, -webkit-transform 0s linear 0s';

    assert.notOk(hasTransitions(element), 'element has no transitions');
  });
});
