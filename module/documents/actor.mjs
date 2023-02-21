/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class DeadlandscActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();    
  }

    /** @override */
    prepareBaseData() {
      // Data modifications in this step occur before processing embedded
      // documents or derived data.
    }
  
    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
      const actorData = this;
      //const data = this.system;
      //const flags = this.flags.DeadlandscActor || {};
      Handlebars.registerHelper('timesdice', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
        {
            accum += block.fn(this);
            if(i < (n-1))
            accum += ", ";
        }
        return accum;
      });
  
      Handlebars.registerHelper('ifCond', function(v1, v2, options) {
        if(v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      });
  
      // Make separate methods for each Actor type (character, npc, etc.) to keep
      // things organized.
      console.log(actorData);
      if (actorData.type === 'PJ') this._preparePJData(actorData.system);
      if (actorData.type === 'PNJ') this._preparePNJData(actorData.system);
    }
  

  /**
   * Prepare Character type specific data
   */
  _preparePJData(actorData) {
    console.log(`Deadlands Classique | Préparation Data PJ.\n`);
    console.log(actorData);
    // Calcul Allure
    actorData.allure=actorData.physique.agilite.de;
    // Calcul souffle Max
    actorData.souffleMax=actorData.physique.vigueur.de + actorData.mental.ame.de;

    // Loop through ability scores, and add their modifiers to our sheet output.
    //for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
    //  ability.mod = Math.floor((ability.value - 10) / 2);
    //}
  }

  _preparePNJData(actorData) {
    const data = actorData.system;

    // Make modifications to data here. For example:

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }

  /**
   * Override getRollData() that's supplied to rolls.
  
   getRollData() {
    const data = super.getRollData();

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    for (let [k, v] of Object.entries(data.abilities)) {
      data[k] = foundry.utils.deepClone(v);
    }

    // Add level for easier access, or fall back to 0.
    data.lvl = data.attributes.level.value ?? 0;

    return data;
  }
 */
  async Initiative() {
    let lignes=[];
    let content=[];
    let serie = [];
    let nb = 2;
    var cardnb='';
    var cardco='';
    let messageJoker="";

    //Tirage de nb cartes
    while (nb)
    {
      serie = this.Tirer();
      
      if(serie[0]=='V'){
        cardnb='V';
      }else if(serie[0]=='Q'){
        cardnb='D';
      }else if(serie[0]=='K'){
        cardnb='R';
      }else {
        cardnb=serie[0];
      }
      if(serie[1]=='trefle'){
        cardco='T';
      }else if(serie[1]=='pique'){
        cardco='P';
      }else if(serie[1]=='coeur'){
        cardco='C';
      }else {
        cardco='D';
      }
      content.push(cardnb+cardco);
      //content.push(serie[0]+" "+serie[1]);
      lignes.push(serie[2]);
      console.log(serie[3]);
      
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
    let actorData = this.system;
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
    this.update({
      'system.deck': actorData.deck,
      'system.defausse': actorData.defausse,
    });
    return carte;
  }

  Melange() {
    let actorData = this.system;
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
    this.update({
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
      console.log(actorData);
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
    let actorData = this.system;
    await this.update({
        'system.souffle': actorData.souffle + 1,
    });
  } 

  async BlessurePlus(loc){
    let actorData = this.system;
    if (actorData[loc] < 5) {
      await this.update({      
        ['system.' + loc]: actorData[loc] + 1,
      });
    }
  }

  async BlessureMoins(loc){
    let actorData = this.system;
    if (actorData[loc] > 0) {
      await this.update({
        ['system.' + loc]: actorData[loc] - 1,
      });
    }
  }

  _onArmor(event){
        var genre=event.target.dataset["genre"];
        var objetaequipe=event.target.dataset["name"]; 
        var main=event.target.dataset["equip"]; 
        if(genre=="arme" ){
          if(main=="gauche"){
            this.update({'system.armeg':objetaequipe});
          }else {
            this.update({'system.armed':objetaequipe});
          }
        }else if(genre=="chargeur"){
          if(main=="gauche"){
            this.update({'system.chargeg':objetaequipe});
          }else {
            this.update({'system.charged':objetaequipe});
          }
        }
    }

    _onDesArmor(event){
        var genre=event.target.dataset["genre"];

        if(genre=="armed" ){
            this.update({'system.armed':''});
        }else  if(genre=="armeg" ){
            this.update({'system.armeg':''});
        }else if(genre=='chargeurd'){
            this.update({'system.charged':''});
        }else if(genre=='chargeurg'){
            this.update({'system.chargeg':''});
        } 
    }
    
}