import {Injectable} from '@angular/core';

interface IModal {
  id: string,
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {
  }

  isModalOpen(id: string): boolean {
    return !!this.modals.find(element => element.id === id)?.visible;
  }

  toggleModel(id: string): void {
    const modal = this.modals.find(element => element.id === id);

    if (modal) {
      modal.visible = !modal.visible;
    }
  }

  register(id: string): void {
    this.modals.push({
      id,
      visible: false
    });
  }

  unregister(id: string): void {
    this.modals = this.modals.filter(
      element => element.id !== id
    );
  }
}
