/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
  
      // Actor partials.
      'systems/deadlandsc/templates/item/partials/header.html',
      'systems/deadlandsc/templates/item/partials/header-delete.html',
      'systems/deadlandsc/templates/item/partials/description.html',
      'systems/deadlandsc/templates/item/partials/actions.html',
    ]);
  };
  