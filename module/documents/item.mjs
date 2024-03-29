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
  }

    /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
     getRollData() {
      // If present, return the actor's roll data.
     if ( !this.actor ) return null;
     const rollData = this.actor.getRollData();
     rollData.item = foundry.utils.deepClone(this.data.data);
     return rollData;
    }
  

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    // Basic template rendering data
    //const token = this.actor.token;
    const item = this.system;
    //const actorData = this.actor ? this.actor.system : {};
    //const itemData = item.system;
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    
    if (!this.data.data.formula) {
        ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.data.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
  
  MunMoins(){
    let itemData = this.system;
    let qty=itemData.quantite;
    qty--;
    this.update({'system.quantite':qty});
  }
}
