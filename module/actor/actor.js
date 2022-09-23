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

    const actorData = this.system;
    const data = actorData;
    const flags = actorData.flags;

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
    if (actorData.type === 'PJ') this._preparePJData(actorData);
    if (actorData.type === 'PNJ') this._preparePNJData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _preparePJData(actorData) {
    const data = actorData.system;
    console.log(`Deadlands Classique | Préparation Data PJ.\n`);
    console.log(data);
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
    const data = actorData;

    // Make modifications to data here. For example:

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }

  async Initiative() {
    let lignes=[];
    let content=[];
    let actorData = this.system;
    let serie = [];
    let nb = 2;
    let messageJoker="";

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
      'data.deck': actorData.deck,
      'data.defausse': actorData.defausse,
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
      'data.deck': actorData.deck,
      'data.defausse': [],
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
              'data.souffle': actorData.souffle - 1,
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
        'data.souffle': actorData.souffle + 1,
    });
  } 

  async BlessurePlus(loc){
    let actorData = this.system;
    if (actorData[loc] < 5) {
      await this.update({      
        ['data.' + loc]: actorData[loc] + 1,
      });
    }
  }

  async BlessureMoins(loc){
    let actorData = this.system;
    if (actorData[loc] > 0) {
      await this.update({
        ['data.' + loc]: actorData[loc] - 1,
      });
    }
  }

}