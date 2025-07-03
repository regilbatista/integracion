const router = require('express').Router();
const { Modelos, Marcas} = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let models = await Modelos.findAll({
             //where: {} 
             include: [
                {
                    model: Marcas,
                },
            ] 
            });
            models = JSON.parse(JSON.stringify(models));

        // await Promise.all(
        //     models.map(async (item) => {
        //         let areas = await Areas.findOne({ where: { id: item.area_Id } });
        //         areas = JSON.parse(JSON.stringify(areas));

        //         item.area = areas.area;
        //         item.sku_code = areas.sku_code;
        //     })
        // );

        return res.status(200).json(models);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Modelos.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Marcas,
                },
            ] 
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
        const { descripcion, marca_Id, estado_Id } = req.body;

        const data = await Modelos.create({ descripcion, marca_Id,estado_Id});

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        console.log(error);
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Modelos.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const model = await Modelos.findOne({ where: { id: req.params.id } });

        if (!model) return res.status(200).json([{ error: 'id not found' }]);
    
        model.estado_Id = model.estado_Id === 1 ? 2 : 1;
        await model.save();
    
        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
