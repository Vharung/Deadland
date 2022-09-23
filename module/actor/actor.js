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
}