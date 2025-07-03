const router = require('express').Router();
const { Vehiculos, TiposVehiculos,TiposCombustibles, Marcas, Modelos } = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let vehicles = await Vehiculos.findAll({
             //where: {} 
             include: [
                {
                    model: TiposVehiculos,
                },
                {
                    model: TiposCombustibles,
                },
                {
                    model: Marcas,
                },
                {
                    model: Modelos,
                },
             ],
            });
            vehicles = JSON.parse(JSON.stringify(vehicles));

        // await Promise.all(
        //     vehicles.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(vehicles);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Vehiculos.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: TiposVehiculos,
                },
                {
                    model: TiposCombustibles,
                },
                {
                    model: Marcas,
                },
                {
                    model: Modelos,
                },
             ],
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
        const { descripcion, NoChasis, NoMotor, NoPlaca, tipoVehiculo_Id, marca_Id,modelo_Id,tipoCombustible_Id, estado_Id } = req.body;

        const data = await Vehiculos.create({ descripcion, NoChasis, NoMotor, NoPlaca, tipoVehiculo_Id, marca_Id,modelo_Id,tipoCombustible_Id, estado_Id});

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Vehiculos.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const vehicles = await Vehiculos.findOne({ where: { id: req.params.id } });

        if (!vehicles) return res.status(200).json([{ error: 'id not found' }]);

        vehicles.estado_Id = vehicles.estado_Id === 1 ? 2 : 1;
        await vehicles.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
