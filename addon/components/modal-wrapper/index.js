import Component from '@glimmer/component';
import { camelize } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ModalWrapperComponent extends Component {
  @tracked element;
  @tracked visible = false;

  get dataId() {
    return camelize(this.args.model.fullname);
  }

  get dataModalShow() {
    return String(this.visible);
  }

  get componentName() {
    return this.args.model.fullname;
  }

  @action
  onDidInsert(element) {
    this.element = element;
  }

  @action
  changeVisibility(value) {
    this.visible = value;
  }
}
