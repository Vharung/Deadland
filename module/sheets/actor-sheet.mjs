import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
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
      width: 1250,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.actor.system;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.data;
    context.flags = actorData.flags;
    console.log(context);
    // Prepare items.
    if (actorData.type == 'PJ') {
      this._prepareCharacterItems(context);
    }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        
    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(context) {
    const actorData = context.actor;

    // Initialize containers.
    const armes = [];
    const features = [];
    const pouvoirs = [];
    const atouts = [];
    const handicaps = [];
    const munitions = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of context.items) {
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
      // Append to munitions.
      else if (i.type === 'munitions') {
        munitions.push(i);
      }
    }

    // Assign and return
    context.armes = armes;
    context.features = features;
    context.pouvoirs = pouvoirs;
    context.atouts = atouts;
    context.handicaps = handicaps;
    context.munitions = munitions;
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
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

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

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
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
  	
  	html.find('.maingauche').click(this.actor._onArmor.bind(this));
    html.find('.maindroite').click(this.actor._onArmor.bind(this));
    html.find('.desequi').click(this.actor._onDesArmor.bind(this));

    html.find( ".refbar" ).each(function( index ) {
          var pc=$( this ).val();
          var name=$( this ).attr('data-zone');
          var z=0;var t='';
          if(name=="tete"){
            z=1;t='t';
          } else if(name=="torse"){
            z=2;t='to';
          } else if(name=="bd"){
            z=3;t='tbd';
          } else if(name=="bg"){
            z=4;t='tbg';
          } else if(name=="jd"){
            z=5;t='tjd';
          } else if(name=="jg"){
            z=6;t='tjg';
          }
          pc=(5-parseInt(pc))*20;
          if(pc>'60'){
            $('.zone.'+name+' .bar').css({'background':'#00abab','width':pc+'%'});
            $('.z'+z).css({'background':' url(systems/deadlandsc/assets/icon/'+t+'1.png) center center no-repeat'});
          }else if(pc>'30'){
            $('.zone.'+name+' .bar').css({'background':'#c9984b','width':pc+'%'});
            $('.z'+z).css({'background':' url(systems/deadlandsc/assets/icon/'+t+'2.png) center center no-repeat'});
          }else if(pc<=0){
            $('.zone.'+name+' .bar').css({'background':'#460000','width':pc+'%'});
            $('.z'+z).css({'background':' url(systems/deadlandsc/assets/icon/'+t+'0.png) center center no-repeat'});
          }else{
            $('.zone.'+name+' .bar').css({'background':'#a10001','width':pc+'%'});
            $('.z'+z).css({'background':' url(systems/deadlandsc/assets/icon/'+t+'3.png) center center no-repeat'});
          }
        });
        
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
   async _onItemCreate(event) {
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
    return await Item.create(itemData, {parent: this.actor});
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

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
