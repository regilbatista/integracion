const router = require('express').Router();
const { Clientes } = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let customers = await Clientes.findAll({
             //where: {} 
            });
            customers = JSON.parse(JSON.stringify(customers));

        // await Promise.all(
        //     customers.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(customers);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Clientes.findOne({
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
        
        const { nombre, cedula, NoTarjetaCR, limiteCredito, tipoPersona, estado_Id } = req.body;

        if (!nombre || !cedula || !NoTarjetaCR || !limiteCredito || !tipoPersona) {
            return res.status(200).json([{ msg: 'Missing required fields' }]);
        }

        const customer = await Clientes.findOne({ where: { cedula: cedula } });
        if (customer) return res.status(200).json([{ msg: 'La cedula ya existe en los registro' }]);

        const data = await Clientes.create({ nombre, cedula, NoTarjetaCR, limiteCredito, tipoPersona, estado_Id });

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        console.log(error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Clientes.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const customers = await Clientes.findOne({ where: { id: req.params.id } });

        if (!customers) return res.status(200).json([{ error: 'id not found' }]);

        customers.estado_Id = customers.estado_Id === 1 ? 2 : 1;
        await customers.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
