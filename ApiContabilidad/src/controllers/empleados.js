const router = require('express').Router();
const { Empleados, Users } = require('../config/db/database');
const { Op } = require('sequelize');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let employees = await Empleados.findAll({
             //where: {} 
            });
            employees = JSON.parse(JSON.stringify(employees));

        // await Promise.all(
        //     employees.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(employees);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get("/users", async (req, res) => {
    try {
        const employees = await Empleados.findAll({ attributes: ["user_Id"] });

        // Obtener los IDs válidos (sin null)
        const ableUsers = employees
            .map(({ user_Id }) => user_Id)
            .filter(Boolean); // Filtra valores null o undefined

        // Si no hay empleados o todos los user_Id son null, traer todos los usuarios
        const whereCondition = ableUsers.length ? { id: { [Op.notIn]: ableUsers } } : {};

        const users = await Users.findAll({ where: whereCondition });

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Empleados.findOne({
            where: { id: req.params.id }
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }

});

/* Inserta un registro en la tabla */
router.post('/', async (req, res) => {
    try {
        const { nombre, cedula, tandaLabor, porcientoComision, fechaIngreso, user_Id, estado_Id } = req.body;
        
        const employees = await Empleados.findOne({ where: { id: req.body.cedula } });
        if (employees) return res.status(200).json([{ msg: 'La cedula ya existe en los registro' }]);

        const data = await Empleados.create({ nombre, cedula, tandaLabor, porcientoComision, fechaIngreso, user_Id, estado_Id});

        return res.status(200).json([{  id: data.id }]);
        
    } catch (error) {
        console.log(error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Empleados.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const employees = await Empleados.findOne({ where: { id: req.params.id } });

        if (!employees) return res.status(200).json([{ error: 'id not found' }]);

        employees.estado_Id = employees.estado_Id === 1 ? 2 : 1;
        await employees.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
