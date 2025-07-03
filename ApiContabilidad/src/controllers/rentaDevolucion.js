const router = require('express').Router();
const { RentaDevolucion, Vehiculos, Empleados, Clientes } = require('../config/db/database');
const { Op, Sequelize  } = require('sequelize');

/* Devuelve el listado de la tabla unit */
router.get('/', async (req, res) => {
    try {
        let rentDevolution = await RentaDevolucion.findAll({
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
            rentDevolution = JSON.parse(JSON.stringify(rentDevolution));


        return res.status(200).json(rentDevolution);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

router.get('/vehiculos', async (req, res) => {
    try {
        const rentDevolution = await RentaDevolucion.findAll({
            where: { estado_Id: 1 } ,
            attributes: ['vehiculo_Id'], // Solo obtener los IDs de los vehículos rentados
            raw: true
        });

        // Extraer los IDs de los vehículos rentados
        const rentedVehicleIds = rentDevolution.map(renta => renta.vehiculo_Id);

        let vehicles = await Vehiculos.findAll({
             where: {estado_Id: 1, id: { [Op.notIn]: rentedVehicleIds },} 
            });
            vehicles = JSON.parse(JSON.stringify(vehicles));

        return res.status(200).json(vehicles);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});


router.get("/masrentados", async (req, res) => {
    try {
      const mostRentedVehicles = await RentaDevolucion.findAll({
        attributes: [
          "vehiculo_Id",
          [Sequelize.fn("COUNT", Sequelize.col("vehiculo_Id")), "cantidad_rentas"],
        ],
        group: ["vehiculo_Id"],
        order: [[Sequelize.literal("cantidad_rentas"), "DESC"]],
        limit: 10, // Ajusta este valor según la cantidad de vehículos que quieres mostrar
        raw: true,
      });
  
      // Extraer los IDs de los vehículos más rentados
      const vehicleIds = mostRentedVehicles.map((renta) => renta.vehiculo_Id);
  
      // Obtener detalles de los vehículos más rentados
      const vehicles = await Vehiculos.findAll({
        where: { id: { [Op.in]: vehicleIds } },
        raw: true,
      });
  
      // Combinar la información de rentas con los detalles de los vehículos
      const result = mostRentedVehicles.map((renta) => {
        const vehicle = vehicles.find((v) => v.id === renta.vehiculo_Id);
        return { ...vehicle, cantidad_rentas: renta.cantidad_rentas };
      });
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json([{ error: error.toString() }]);
    }
  });
  

  

router.get('/:id', async (req, res) => {

    try {
        const data = await RentaDevolucion.findOne({
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

/* Inserta un registro en la tabla */
router.post('/', async (req, res) => {
    try {
        const { empleado_Id, vehiculo_Id, cliente_Id, FechaRenta, FechaDevolucion, MontoPorDia,CantidadDias,Comentario, estado_Id } = req.body;

        const data = await RentaDevolucion.create({ empleado_Id, vehiculo_Id, cliente_Id, FechaRenta, FechaDevolucion, MontoPorDia,CantidadDias,Comentario, estado_Id});

        return res.status(200).json([{ id: data.id }]);
        
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/* Actualiza un registro en la tabla */
router.patch('/:id', async (req, res) => {

    try {

        await RentaDevolucion.update(req.body, { where: { id: req.params.id } });

        res.status(200).json([{ msg: 'ok' }]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }

});

/* Actualiza el estado de un registro en la tabla */
router.delete('/:id', async (req, res) => {
    try {
        const rentDevolution = await RentaDevolucion.findOne({ where: { id: req.params.id } });

        if (!rentDevolution) return res.status(200).json([{ error: 'id not found' }]);

        rentDevolution.estado_Id = rentDevolution.estado_Id === 1 ? 2 : 1;
        await rentDevolution.save();

        res.status(200).json([{ msg: 'ok' }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;
