/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class DeadlandscActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {

    return mergeObject(super.defaultOptions, {
      classes: ["deadlandsc", "sheet", "actor"],
      template: "systems/deadlandsc/templates/actor/actor-sheet.html",
      width: 1200,
      height: 900,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    console.log(data); 
    data.dtypes = ["String", "Number", "Boolean"];
    //for (let attr of Object.values(data.data.attributes)) {
    //  attr.isCheckbox = attr.dtype === "Boolean";
    //}

    // Prepare items.
    if (this.actor.type == 'PJ') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const armes = [];
    const features = [];
    const pouvoirs = [];
    const atouts = [];
    const handicaps = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.items;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'armes') {
        armes.push(i);
      }
      // Append to features.
      else if (i.type === 'objets') {
        features.push(i);
      }
      // Append to pouvoirs.
      else if (i.type === 'pouvoirs') {
        pouvoirs.push(i);
      }
      // Append to atouts.
      else if (i.type === 'atouts') {
        atouts.push(i);
      }
      // Append to handicaps.
      else if (i.type === 'handicaps') {
        handicaps.push(i);
      }
    }

    // Assign and return
    actorData.armes = armes;
    actorData.features = features;
    actorData.pouvoirs = pouvoirs;
    actorData.atouts = atouts;
    actorData.handicaps = handicaps;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(ev => {
        event.preventDefault();
        const dataType=$(ev.currentTarget).data('type');
        const name = `New ${dataType.capitalize()}`;
        this.actor.createEmbeddedDocuments('Item', [{ name: name, type: dataType }], { renderSheet: true })
    }); 

    // Update Inventory Item
    html.find('.item-edit').click(this._onItemEdit.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        let d = Dialog.confirm({
            title: game.i18n.localize("liber.suppr"),
            content: "<p>"+game.i18n.localize("liber.confirsuppr")+ item.name + "'.</p>",
            yes: () => item.delete(),
            no: () => { },
            defaultYes: false
        });
        li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    //PS + 1
    html.find('.PSadd').on('click', () => {
      this.actor.PSplus();
    });

    //PS - 1
    html.find('.PSsub').on('click', () => {
        this.actor.PSmoins();
    });

    //Blessure tête + 1
    html.find('.btete').on('click', () => {
      //this.actor.BlessureTetePlus();
      this.actor.BlessurePlus("btete");
    });
    
    //Blessure tête - 1
    html.find('.btete').on('contextmenu', () => {
      //this.actor.BlessureTeteMoins();
      this.actor.BlessureMoins("btete");
    });

    //Blessure bras gauche + 1
    html.find('.bbrasgauche').on('click', () => {
      this.actor.BlessurePlus("bbrasgauche");
    });
    
    //Blessure bras gauche - 1
    html.find('.bbrasgauche').on('contextmenu', () => {
      this.actor.BlessureMoins("bbrasgauche");
    });

    //Blessure bras droit + 1
    html.find('.bbrasdroit').on('click', () => {
      this.actor.BlessurePlus("bbrasdroit");
    });
    
    //Blessure bras droit - 1
    html.find('.bbrasdroit').on('contextmenu', () => {
      this.actor.BlessureMoins("bbrasdroit");
    });

    //Blessure tripes + 1
    html.find('.btripes').on('click', () => {
      this.actor.BlessurePlus("btripes");
    });
    
    //Blessure tripes - 1
    html.find('.btripes').on('contextmenu', () => {
      this.actor.BlessureMoins("btripes");
    });

    //Blessure jambe gauche + 1
    html.find('.bjambegauche').on('click', () => {
      this.actor.BlessurePlus("bjambegauche");
    });
    
    //Blessure jambe gauche - 1
    html.find('.bjambegauche').on('contextmenu', () => {
      this.actor.BlessureMoins("bjambegauche");
    });

    //Blessure jambe droite + 1
    html.find('.bjambedroite').on('click', () => {
      this.actor.BlessurePlus("bjambedroite");
    });
    
    //Blessure jambe droite - 1
    html.find('.bjambedroite').on('contextmenu', () => {
      this.actor.BlessureMoins("bjambedroite");
    });

    //Lab Initiative
    html.find('.initbutton').on('click', () => {
      this.actor.Initiative();
    });

    //Lab Mélanger
    html.find('.melange').on('click', () => {
      this.actor.Melange();
    });
  
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.system.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  getItemFromEvent = (ev) => {
      const parent = $(ev.currentTarget).parents(".item");
      return this.actor.items.get(parent.data("itemId"));
  }

  _onItemEdit(event){
      const item = this.getItemFromEvent(event);
      item.sheet.render(true);
  }

  

}
