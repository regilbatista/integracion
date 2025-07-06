const router = require('express').Router();
const { LogsWebServices, WebServices, Users } = require('../config/db/database');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/admin/logsWebServices:
 *   get:
 *     summary: Obtiene todos los logs de web services (generados automáticamente)
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de registros a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Número de registros a omitir
 *     responses:
 *       200:
 *         description: Lista de logs de web services
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;
        
        let logs = await LogsWebServices.findAll({
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion', 'url', 'metodo']
                },
                {
                    model: Users,
                    attributes: ['usuario'],
                    required: false // LEFT JOIN para permitir logs sin usuario
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        logs = JSON.parse(JSON.stringify(logs));
        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/stats:
 *   get:
 *     summary: Obtiene estadísticas de uso de web services
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Número de días hacia atrás para calcular estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de uso
 */
router.get('/stats', async (req, res) => {
    try {
        const { dias = 7 } = req.query;
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - parseInt(dias));

        // Estadísticas generales
        const totalLogs = await LogsWebServices.count({
            where: {
                fechaHora: {
                    [Op.gte]: fechaInicio
                }
            }
        });

        // Logs por web service
        const logsPorServicio = await LogsWebServices.findAll({
            attributes: [
                'webService_Id',
                [LogsWebServices.sequelize.fn('COUNT', LogsWebServices.sequelize.col('id')), 'total']
            ],
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'url', 'metodo']
                }
            ],
            where: {
                fechaHora: {
                    [Op.gte]: fechaInicio
                }
            },
            group: ['webService_Id', 'WebService.id'],
            order: [[LogsWebServices.sequelize.literal('total'), 'DESC']]
        });

        // Logs por usuario (top 10)
        const logsPorUsuario = await LogsWebServices.findAll({
            attributes: [
                'usuario_Id',
                [LogsWebServices.sequelize.fn('COUNT', LogsWebServices.sequelize.col('LogsWebServices.id')), 'total']
            ],
            include: [
                {
                    model: Users,
                    attributes: ['usuario'],
                    required: false
                }
            ],
            where: {
                fechaHora: {
                    [Op.gte]: fechaInicio
                },
                usuario_Id: {
                    [Op.not]: null
                }
            },
            group: ['usuario_Id', 'User.id'],
            order: [[LogsWebServices.sequelize.literal('total'), 'DESC']],
            limit: 10
        });

        // Logs por día
        const logsPorDia = await LogsWebServices.findAll({
            attributes: [
                [LogsWebServices.sequelize.fn('DATE', LogsWebServices.sequelize.col('fechaHora')), 'fecha'],
                [LogsWebServices.sequelize.fn('COUNT', LogsWebServices.sequelize.col('id')), 'total']
            ],
            where: {
                fechaHora: {
                    [Op.gte]: fechaInicio
                }
            },
            group: [LogsWebServices.sequelize.fn('DATE', LogsWebServices.sequelize.col('fechaHora'))],
            order: [[LogsWebServices.sequelize.literal('fecha'), 'ASC']]
        });

        // Errores recientes (si tienes el campo statusCode)
        let erroresRecientes = [];
        try {
            erroresRecientes = await LogsWebServices.findAll({
                where: {
                    fechaHora: {
                        [Op.gte]: fechaInicio
                    },
                    statusCode: {
                        [Op.gte]: 400
                    }
                },
                include: [
                    {
                        model: WebServices,
                        attributes: ['nombre', 'url']
                    },
                    {
                        model: Users,
                        attributes: ['usuario'],
                        required: false
                    }
                ],
                order: [['fechaHora', 'DESC']],
                limit: 20
            });
        } catch (error) {
            // Si no existe el campo statusCode, ignorar
            console.log('Campo statusCode no disponible');
        }

        return res.status(200).json({
            totalLogs,
            diasAnalizados: parseInt(dias),
            logsPorServicio: JSON.parse(JSON.stringify(logsPorServicio)),
            logsPorUsuario: JSON.parse(JSON.stringify(logsPorUsuario)),
            logsPorDia: JSON.parse(JSON.stringify(logsPorDia)),
            erroresRecientes: JSON.parse(JSON.stringify(erroresRecientes))
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/usuario/{userId}:
 *   get:
 *     summary: Obtiene logs de un usuario específico
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Logs del usuario
 */
router.get('/usuario/:userId', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const logs = await LogsWebServices.findAll({
            where: { usuario_Id: req.params.userId },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion', 'url', 'metodo']
                },
                {
                    model: Users,
                    attributes: ['usuario']
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: parseInt(limit)
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/servicio/{serviceId}:
 *   get:
 *     summary: Obtiene logs de un web service específico
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del web service
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Logs del web service
 */
router.get('/servicio/:serviceId', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const logs = await LogsWebServices.findAll({
            where: { webService_Id: req.params.serviceId },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion', 'url', 'metodo']
                },
                {
                    model: Users,
                    attributes: ['usuario'],
                    required: false
                }
            ],
            order: [['fechaHora', 'DESC']],
            limit: parseInt(limit)
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/periodo:
 *   get:
 *     summary: Obtiene logs por período de tiempo
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: webServiceId
 *         schema:
 *           type: integer
 *         description: Filtrar por web service específico
 *     responses:
 *       200:
 *         description: Logs del período
 */
router.get('/periodo', async (req, res) => {
    try {
        const { fechaInicio, fechaFin, webServiceId } = req.query;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json([{ error: 'fechaInicio and fechaFin are required' }]);
        }

        const whereClause = {
            fechaHora: {
                [Op.between]: [fechaInicio, fechaFin]
            }
        };

        if (webServiceId) {
            whereClause.webService_Id = webServiceId;
        }

        const logs = await LogsWebServices.findAll({
            where: whereClause,
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion', 'url', 'metodo']
                },
                {
                    model: Users,
                    attributes: ['usuario'],
                    required: false
                }
            ],
            order: [['fechaHora', 'DESC']]
        });

        return res.status(200).json(logs);
    } catch (error) {
        console.log(error);
        return res.status(500).json([{ error: error.toString() }]);
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/{id}:
 *   get:
 *     summary: Obtiene un log de web service por ID
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del log
 *     responses:
 *       200:
 *         description: Log encontrado
 */
router.get('/:id', async (req, res) => {
    try {
        const data = await LogsWebServices.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: WebServices,
                    attributes: ['nombre', 'descripcion', 'url', 'metodo']
                },
                {
                    model: Users,
                    attributes: ['usuario'],
                    required: false
                }
            ]
        });

        if (!data) return res.status(404).json({ error: 'Log not found' });
        return res.status(200).json([data]);

    } catch (error) {
        return res.status(400).json([{ error: error.toString() }])
    }
});

/**
 * @swagger
 * /api/admin/logsWebServices/cleanup:
 *   delete:
 *     summary: Limpia logs antiguos (más de X días)
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         required: true
 *         schema:
 *           type: integer
 *         description: Eliminar logs más antiguos que este número de días
 *     responses:
 *       200:
 *         description: Logs eliminados exitosamente
 */
router.delete('/cleanup', async (req, res) => {
    try {
        const { dias } = req.query;

        if (!dias || dias < 1) {
            return res.status(400).json([{ error: 'Debe especificar un número válido de días' }]);
        }

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));

        const deletedCount = await LogsWebServices.destroy({
            where: {
                fechaHora: {
                    [Op.lt]: fechaLimite
                }
            }
        });

        res.status(200).json([{ 
            msg: 'Cleanup completed',
            deletedRecords: deletedCount,
            cutoffDate: fechaLimite.toISOString()
        }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

/**
 * NOTA: Los métodos POST, PATCH y DELETE han sido removidos
 * porque los logs ahora se generan automáticamente por el middleware.
 * 
 * Solo mantenemos el DELETE para cleanup/mantenimiento.
 */

/**
 * @swagger
 * /api/admin/logsWebServices/{id}:
 *   delete:
 *     summary: Elimina un log específico por ID
 *     tags: [Logs Web Services]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del log a eliminar
 *     responses:
 *       200:
 *         description: Log eliminado exitosamente
 *       404:
 *         description: Log no encontrado
 */
router.delete('/:id', async (req, res) => {
    try {
        const log = await LogsWebServices.findOne({ where: { id: req.params.id } });

        if (!log) {
            return res.status(404).json([{ error: 'Log not found' }]);
        }

        await log.destroy();

        res.status(200).json([{ 
            msg: 'Log deleted successfully',
            action: 'deleted',
            id: req.params.id
        }]);
    } catch (error) {
        return res.status(400).json([{ error: error.toString() }]);
    }
});

module.exports = router;