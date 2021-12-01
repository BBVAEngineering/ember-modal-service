import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ModalContainerComponent extends Component {
  @service modal;

  get fullHeight() {
    return !!this.modal.content.length;
  }
}
