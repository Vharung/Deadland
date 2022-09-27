/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class DeadlandscItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.system;
    const actorData = this.actor ? this.actor.system : {};
    const data = itemData.system;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.system;
    const actorData = this.actor ? this.actor.system : {};
    const itemData = item.system;

    let roll = new Roll('d20+@abilities.str.mod', actorData);
    let label = `Rolling ${item.name}`;
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label
    });
  }

  MunMoins(){
    let itemData = this.system;
    let qty=itemData.quantite;
    qty--;
    this.update({'system.quantite':qty});
  }
}
