// Import Modules
import { DeadlandscActor } from "./documents/actor.mjs";
import { DeadlandscActorSheet } from "./sheets/actor-sheet.mjs";
import { DeadlandscItem } from "./documents/item.mjs";
import { DeadlandscItemSheet } from "./sheets/item-sheet.mjs";
import { preloadHandlebarsTemplates } from "./helpers/template.mjs";
import { DEADLANDSC } from "./helpers/config.mjs";
import { DeadlandscCombat } from "./combat/combat.mjs";
import { DeadlandscCombatTracker } from "./combat/combatTracker.mjs";

Hooks.once('init', async function() {

  console.log(`Deadlands Classique | Init du système Deadlands Classique.\n`);

  // gestion des namespaces
  game.deadlandsc = {
    DeadlandscActor,
    DeadlandscItem,
    DeadlandscCombat,
    DeadlandscCombatTracker,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.DEADLANDSC = DEADLANDSC;

  /**
   * Set an initiative formula for the system
   * @type {String}
   * @physique.rapidite.coordinationd@physique.rapidite.dé
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };


  // Define custom Document classes (remplacement des classes objet par défaut)
  CONFIG.Actor.documentClass = DeadlandscActor;
  CONFIG.Item.documentClass = DeadlandscItem;
  CONFIG.Combat.documentClass = DeadlandscCombat;
  CONFIG.ui.combat = DeadlandscCombatTracker;
  //CONFIG.time.roundTime = 80;

  // Register sheet application classes (remplacement dess fiches par defaut par les fiches du système Deadlandsc)
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("deadlandsc", DeadlandscActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("deadlandsc", DeadlandscItemSheet, { makeDefault: true });


  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();

});

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;
  //const item = data.system;
  // Create the macro command
  const command = `game.deadlandsc.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "deadlandsc.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}