module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('teacher', {
        name: {
            type: DataTypes.STRING
        },
        position: {
            type: DataTypes.INTEGER
        },
        __id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    });
    Teacher.associate = function (models) {
        Teacher.belongsTo(models.group);
        Teacher.hasMany(models.student);
    };
    return Teacher;
};
