const router = require('express').Router();
const { TiposVehiculos } = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let vehiclesTypes = await TiposVehiculos.findAll({
             //where: {} 
            });
            vehiclesTypes = JSON.parse(JSON.stringify(vehiclesTypes));

        // await Promise.all(
        //     vehiclesTypes.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(vehiclesTypes);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await TiposVehiculos.findOne({
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
        const { descripcion, estado_Id } = req.body;

        const data = await TiposVehiculos.create({ descripcion, estado_Id});

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await TiposVehiculos.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const vehiclesTypes = await TiposVehiculos.findOne({ where: { id: req.params.id } });

        if (!vehiclesTypes) return res.status(200).json([{ error: 'id not found' }]);

        vehiclesTypes.estado_Id = vehiclesTypes.estado_Id === 1 ? 2 : 1;
        await vehiclesTypes.save();


        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
