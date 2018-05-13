
var colors = new Map();
var categories = new Map();

var newCategory = function(code, desc, svg, color) {
  return {
    code: code,
    svgFile: svg,
    color: color,
    description: desc
  };
}

colors.set('green', '#4CAF50');
colors.set('red', '#F44336');
colors.set('pink', '#E91E63');
colors.set('purple', '#9C27B0');
colors.set('deep-purple', '#673AB7');
colors.set('indigo', '#3F51B5');
colors.set('blue', '#2196F3');
colors.set('light-blue', '#03A9F4');
colors.set('cyan', '#00BCD4');
colors.set('teal', '#009688');
colors.set('green', '#4CAF50');
colors.set('light-green', '#8BC34A');
colors.set('lime', '#CDDC39');
colors.set('yellow', '#FFEB3B');
colors.set('amber', '#FFC107');
colors.set('orange', '#FF9800');
colors.set('deep-orange', '#FF5722');
colors.set('brown', '#795548');
colors.set('grey', '#9E9E9E');
colors.set('blue-grey', '#607D8B');

categories.set('AUTO', newCategory('AUTO', 'Car', 'car.svg', colors.get('red')));
categories.set('CLOTHES', newCategory('CLOTHES', 'Clothes', 'clothes.svg', colors.get('blue')));
categories.set('FURNITURE', newCategory('FURNITURE', 'Furniture', 'furniture.svg', colors.get('lime')));
categories.set('HOME', newCategory('HOME', 'House management', 'house.svg', colors.get('indigo')));
categories.set('PALESTRA', newCategory('PALESTRA', 'Gym', 'gym.svg', colors.get('light-blue')));
categories.set('SALUTE', newCategory('SALUTE', 'Health', 'health.svg', colors.get('pink')));
categories.set('SUPERMERCATO', newCategory('SUPERMERCATO', 'Supermarket', 'supermarket.svg', colors.get('blue-grey')));
categories.set('SVAGO', newCategory('SVAGO', 'Entertainment', 'entertainment.svg', colors.get('amber')));
categories.set('USCITE', newCategory('USCITE', 'Nightlife', 'nightlife.svg', colors.get('brown')));
categories.set('VIAGGI', newCategory('VIAGGI', 'Trips', 'trips.svg', colors.get('yellow')));
categories.set('XMAS', newCategory('XMAS', 'Gifts', 'gifts.svg', colors.get('green')));
categories.set('FOOD', newCategory('FOOD', 'Food', 'food.svg', colors.get('cyan')));
categories.set('VARIE', newCategory('VARIE', 'Other', 'other.svg', colors.get('grey')));

exports.getCategories = function() {

  return new Promise(function(success, failure) {

    var categories = [];

    for (let cat of categories.values) {
      categories.push({
        code: cat.code,
        color: cat.color,
        description: cat.description,
        filename: cat.svgFile
      });
    }
  });

}
