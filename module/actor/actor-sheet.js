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
      this.PSplus();
    });

    //PS - 1
    html.find('.PSsub').on('click', () => {
        this.PSmoins();
    });

    //Blessure tête + 1
    html.find('.btete').on('click', () => {
      //this.actor.BlessureTetePlus();
      this.BlessurePlus("btete");
    });
    
    //Blessure tête - 1
    html.find('.btete').on('contextmenu', () => {
      //this.actor.BlessureTeteMoins();
      this.BlessureMoins("btete");
    });

    //Blessure bras gauche + 1
    html.find('.bbrasgauche').on('click', () => {
      this.BlessurePlus("bbrasgauche");
    });
    
    //Blessure bras gauche - 1
    html.find('.bbrasgauche').on('contextmenu', () => {
      this.BlessureMoins("bbrasgauche");
    });

    //Blessure bras droit + 1
    html.find('.bbrasdroit').on('click', () => {
      this.BlessurePlus("bbrasdroit");
    });
    
    //Blessure bras droit - 1
    html.find('.bbrasdroit').on('contextmenu', () => {
      this.BlessureMoins("bbrasdroit");
    });

    //Blessure tripes + 1
    html.find('.btripes').on('click', () => {
      this.BlessurePlus("btripes");
    });
    
    //Blessure tripes - 1
    html.find('.btripes').on('contextmenu', () => {
      this.BlessureMoins("btripes");
    });

    //Blessure jambe gauche + 1
    html.find('.bjambegauche').on('click', () => {
      this.BlessurePlus("bjambegauche");
    });
    
    //Blessure jambe gauche - 1
    html.find('.bjambegauche').on('contextmenu', () => {
      this.BlessureMoins("bjambegauche");
    });

    //Blessure jambe droite + 1
    html.find('.bjambedroite').on('click', () => {
      this.BlessurePlus("bjambedroite");
    });
    
    //Blessure jambe droite - 1
    html.find('.bjambedroite').on('contextmenu', () => {
      this.BlessureMoins("bjambedroite");
    });

    //Lab Initiative
    html.find('.initbutton').on('click', () => {
      this._onInitiative(this);
    });

    //Lab Mélanger
    html.find('.melange').on('click', () => {
      this.Melange();
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

  async _onInitiative(event) {
    let lignes=[];
    let content=[];
    let actorData = this.actor.system;
    let serie = [];
    let nb = 2;
    let messageJoker="";
    //Tirage de nb cartes
    //Tirage de nb cartes
    while (nb)
    {
      serie = this.Tirer();
      content.push(serie[0]+" "+serie[1]);
      lignes.push(serie[2]);
      // Détection des Joker
      if (serie[0]=="J") {
        if (serie[1]=="coeur") {
          messageJoker = messageJoker + game.i18n.localize("MESSAGE.JR")+'\r';
        }
        else {
          messageJoker = messageJoker + game.i18n.localize("MESSAGE.JN")+'\r';
        }
      }
      nb--;
    }
  
    // preparation du message
    let message = await renderTemplate('systems/deadlandsc/templates/message/Init.html', {
      target: this,
      speaker: game.user,
      lignes: lignes,
      content: content,
      messageJoker: messageJoker,
    });

    //envoi du message dans le chat
    let chatData = {
      content: message,
    };
    ChatMessage.create(chatData);

  }
  Tirer() {
    let actorData = this.actor.system;
    let carte = [];
    //Tirage d'une carte
      carte=actorData.deck.pop();
      actorData.defausse.push(carte);
    //mélange du deck si la carte est le valet noir
    if (carte[0] == "J" && carte[1] == "pique") {
      //rappel de la defausse
      actorData.deck=actorData.deck.concat(actorData.defausse);
      //mélange du deck
      var j = actorData.deck.length, t, i;
      while (j) {
      i = Math.floor(Math.random() * j--);
      t = actorData.deck[j];
      actorData.deck[j] = actorData.deck[i];
      actorData.deck[i] = t;
      }
      //raz de la defausse
      actorData.defausse=[];
    }
    //mise à jour des decks
    this.actor.update({
      'system.deck': actorData.deck,
      'system.defausse': actorData.defausse,
    });
    return carte;
  }

  Melange() {
    let actorData = this.actor.system;
    //rappel de la defausse
    actorData.deck=actorData.deck.concat(actorData.defausse);
    //mélange du deck
    var j = actorData.deck.length, t, i;
    while (j) {
    i = Math.floor(Math.random() * j--);
    t = actorData.deck[j];
    actorData.deck[j] = actorData.deck[i];
    actorData.deck[i] = t;
    }
    //mise à jour des decks
    this.actor.update({
      'system.deck': actorData.deck,
      'system.defausse': [],
    });
  }

  async PSmoins() {
      let message = await renderTemplate('systems/deadlandsc/templates/message/PSM.html', {
          target: this,
          speaker: game.user,
      });
      let chatData = {
          content: message,
      };
          ChatMessage.create(chatData);
      let actorData = this.system;
      if (actorData.souffle > 0) {
          await this.update({
              'system.souffle': actorData.souffle - 1,
          });
      }
  }

  async PSplus() {
    let message = await renderTemplate('systems/deadlandsc/templates/message/PSP.html', {
        target: this,
        speaker: game.user,
    });
    let chatData = {
        content: message,
    };
        ChatMessage.create(chatData);
    let actorData = this.actor.system;
    await this.actor.update({
        'system.souffle': actorData.souffle + 1,
    });
  } 

  async BlessurePlus(loc){
    let actorData = this.actor.system;
    if (actorData[loc] < 5) {
      await this.update({      
        ['system.' + loc]: actorData[loc] + 1,
      });
    }
  }

  async BlessureMoins(loc){
    let actorData = this.actor.system;
    if (actorData[loc] > 0) {
      await this.actor.update({
        ['system.' + loc]: actorData[loc] - 1,
      });
    }
  }

}
