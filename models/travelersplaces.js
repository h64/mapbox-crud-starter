'use strict';
module.exports = (sequelize, DataTypes) => {
  const travelersplaces = sequelize.define('travelersplaces', {
    travelerId: DataTypes.INTEGER,
    placeId: DataTypes.INTEGER
  }, {});
  travelersplaces.associate = function(models) {
    // associations can be defined here
  };
  return travelersplaces;
};