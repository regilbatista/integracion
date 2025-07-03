const router = require('express').Router();
const { Inspeccion, RentaDevolucion , Vehiculos, Empleados, Clientes } = require('../config/db/database');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let Inspection = await Inspeccion.findAll({
             //where: {} 
             include: [
                {
                    model: Vehiculos,
                },
                {
                    model: Empleados,
                },
                {
                    model: Clientes,
                }
             ],
            });
            Inspection = JSON.parse(JSON.stringify(Inspection));


        return res.status(200).json(Inspection);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/rent', async (req, res) => {
    try {
        let rentDevolution = await RentaDevolucion.findAll({
            where: { estado_Id: 1 } ,
            include: [
               {
                   model: Vehiculos,
               },
               {
                   model: Empleados,
               },
               {
                   model: Clientes,
               }
            ],
           });
           rentDevolution = JSON.parse(JSON.stringify(rentDevolution));


       return res.status(200).json(rentDevolution);
    } catch (error) {
        console.log(error);
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/:id', async (req, res) => {

    try {
        const data = await Inspeccion.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: Vehiculos,
                },
                {
                    model: Empleados,
                },
                {
                    model: Clientes,
                }
             ],
        });

        if (!data) return res.status(200).json({ data: 'data not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }

});

/* Inserta un registro en la tabla */router.post('/', async (req, res) => {
    try {
        const { 
            empleado_Id, 
            vehiculo_Id, 
            cliente_Id, 
            rentaDevolucion_Id, 
            tieneRalladuras, 
            cantidadCombustible,
            tieneGomaRespuesta,
            tieneGato,
            tieneRoturasCristal,
            estado_gomas,
            fecha, 
            estado_Id 
        } = req.body;

        // Crear la inspección
        const data = await Inspeccion.create({ 
            empleado_Id, 
            vehiculo_Id, 
            cliente_Id, 
            rentaDevolucion_Id, 
            tieneRalladuras, 
            cantidadCombustible,
            tieneGomaRespuesta,
            tieneGato,
            tieneRoturasCristal,
            estado_gomas,
            fecha,
            estado_Id
        });

        // Buscar la renta asociada
        const rentDevolution = await RentaDevolucion.findOne({ where: { id: rentaDevolucion_Id } });

        if (!rentDevolution) {
            return res.status(404).json([{ error: 'RentaDevolucion no encontrada' }]);
        }

        // Actualizar el estado de la renta a 2
        rentDevolution.estado_Id = 2;
        await rentDevolution.save();

        return res.status(200).json([{ id: data.id }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await Inspeccion.update(req.body, { where: { id: req.params.id } });

          // Buscar la renta asociada
          const rentDevolution = await RentaDevolucion.findOne({ where: { id: req.body?.rentaDevolucion_Id } });

          if (!rentDevolution) {
              return res.status(404).json([{ error: 'RentaDevolucion no encontrada' }]);
          }
  
          // Actualizar el estado de la renta a 2
          rentDevolution.estado_Id = 2;
          await rentDevolution.save();
  

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const Inspection = await Inspeccion.findOne({ where: { id: req.params.id } });

        if (!Inspection) return res.status(200).json([{ error: 'id not found' }]);

        Inspection.estado_Id = Inspection.estado_Id === 1 ? 2 : 1;
        await Inspection.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
