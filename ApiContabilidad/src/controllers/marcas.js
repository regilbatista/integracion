const router = require('express').Router();
const { Marcas } = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let brands = await Marcas.findAll({
             //where: {} 
            });
            brands = JSON.parse(JSON.stringify(brands));

        // await Promise.all(
        //     brands.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(brands);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Marcas.findOne({
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

        const data = await Marcas.create({ descripcion, estado_Id});

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Marcas.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const brand = await Marcas.findOne({ where: { id: req.params.id } });

        if (!brand) return res.status(200).json([{ error: 'id not found' }]);
    
        brand.estado_Id = brand.estado_Id === 1 ? 2 : 1;
        await brand.save();
    
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
