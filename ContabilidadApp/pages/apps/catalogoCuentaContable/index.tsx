import Link from 'next/link';
import sortBy from 'lodash/sortBy';
import { NextPageContext } from 'next';
import { IRootState } from '../../../store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import {showMessage, showConfirm} from '@/utils/notifications';
import {formatDateTime} from '@/utils/utilities';
import { apiGet, apiDelete } from '@/lib/api/main';
import SaveCatalogoCuentaContablesModal from '@/components/pages/catalogoCuentaContables/saveCatalogoCuentaContablesModal';

const PATH = 'catalogoCuentas';

const catalogoCuentasDefault = {
    id: null,
    descripcion: '',
    tipoCuenta_Id: null,
    permiteTransacciones: false,
    nivel: 1,
    cuentaMayor_Id: null,
    balance: 0,
    estado_Id: 1
};

const CatalogoCuentasContables = () => {

    useEffect(() => {
        fetchCatalogoCuentas();
    },[]);

    const fetchCatalogoCuentas = async () => {
        const response = await apiGet({ path: 'catalogoCuentas' });
        setInitialRecords(sortBy(response?.info, 'id'))
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Catálogo de Cuentas Contables'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(catalogoCuentasDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addCatalogoCuentasModal, setAddCatalogoCuentasModal] = useState<any>(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setRecordsData(() => {
            return initialRecords.filter((item: any) => {
                return (
                    item.descripcion?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.TiposCuentum?.descripcion?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.CuentaMayor?.descripcion?.toString().toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const addEditData = (row: any = null) => {
        if (row) {
            setSaveParams(row);
        } else {
            setSaveParams(JSON.parse(JSON.stringify(catalogoCuentasDefault)));
        }
        setAddCatalogoCuentasModal(true);
    };

  const deleteItem = async (row: any) => {
    try {
        const resp = await apiDelete({ path: 'catalogoCuentas', data: saveParams, id: row.id });
        let message = {};
        
        // Verificar si hay error en la respuesta
        if ( resp.status === 400) {
            // El error está en resp.error.response.data
            const errorData = resp.error?.response?.data;
            
            if (errorData && Array.isArray(errorData) && errorData[0]?.error) {
                const errorMessage = errorData[0].error;
                
                // Personalizar mensaje para errores específicos
                if (errorMessage.includes('active sub-accounts')) {
                    message = { 
                        msg: 'No se puede desactivar: esta cuenta tiene subcuentas activas asociadas. Desactive primero las subcuentas.',
                        type: 'error' 
                    };
                } else {
                    message = { 
                        msg: errorMessage, 
                        type: 'error' 
                    };
                }
            } else {
                message = { 
                    msg: resp.message || 'Error al procesar la solicitud', 
                    type: 'error' 
                };
            }
        } else if (resp.info && resp.info[0]?.msg === 'ok') {
            const action = resp.info[0]?.action || 'updated';
            message = { 
                msg: action === 'activated' ? 'Cuenta activada' : 'Cuenta desactivada',
                type: 'success'
            };
            fetchCatalogoCuentas();
        } else {
            // Fallback para cuando no hay info válida
            const errorMsg = resp.info?.[0]?.error || 'Error al cambiar estado de la cuenta';
            message = { 
                msg: errorMsg, 
                type: 'error' 
            };
        }
        
        showMessage(message);
    } catch (error) {
        console.error('Error en deleteItem:', error);
        showMessage({
            msg: 'Error de conexión al servidor',
            type: 'error'
        });
    }
};
    const getNivelDisplay = (nivel: number) => {
        const niveles = {
            1: { text: 'Nivel 1', color: 'bg-blue-500' },
            2: { text: 'Nivel 2', color: 'bg-green-500' },
            3: { text: 'Nivel 3', color: 'bg-orange-500' }
        };
        return niveles[nivel as keyof typeof niveles] || { text: 'N/A', color: 'bg-gray-500' };
    };

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Catálogo de Cuentas Contables</h5>
                    <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button type="button" 
                                onClick={() => addEditData()} 
                                className="btn btn-primary" >
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Añadir Cuenta
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Buscar cuenta, tipo o cuenta mayor..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                        records={recordsData}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'descripcion', title: 'Descripción', sortable: true },
                            {
                                accessor: 'TiposCuentum',
                                title: 'Tipo de Cuenta',
                                sortable: false,
                                render: ({ TiposCuentum }) => (
                                    <div className="flex flex-col flex justify-center items-center">
                                        <span className="font-medium">{TiposCuentum?.descripcion || 'N/A'}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full text-white ${TiposCuentum?.origen === 'DB' ? 'bg-blue-400' : 'bg-green-400'}`}>
                                            {TiposCuentum?.origen === 'DB' ? 'Débito' : 'Crédito'}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                accessor: 'nivel',
                                title: 'Nivel',
                                sortable: true,
                                render: ({ nivel }) => {
                                    const nivelInfo = getNivelDisplay(nivel);
                                    return (
                                        <div className={`badge ${nivelInfo.color} text-white rounded-full px-3 py-1 flex justify-center items-center`}>
                                            {nivelInfo.text}
                                        </div>
                                    );
                                }
                            },
                            {
                                accessor: 'CuentaMayor',
                                title: 'Cuenta Mayor',
                                sortable: false,
                                render: ({ CuentaMayor }) => (
                                    <span className="text-sm">{CuentaMayor?.descripcion || 'N/A'}</span>
                                )
                            },
                            {
                                accessor: 'permiteTransacciones',
                                title: 'Transacciones',
                                sortable: true,
                                render: ({ permiteTransacciones }) => (
                                    <div className={`badge ${permiteTransacciones ? 'bg-green-500' : 'bg-red-500'} text-white rounded-full px-3 py-1`}>
                                        {permiteTransacciones ? 'Sí' : 'No'}
                                    </div>
                                )
                            },
                            {
                                accessor: 'balance',
                                title: 'Balance',
                                sortable: true,
                                render: ({ balance }) => (
                                    <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${parseFloat(balance || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                                    </span>
                                )
                            },
                            {
                                accessor: 'estado_Id',
                                title: 'Estado',
                                sortable: true,
                                render: ({ estado_Id }) => {
                                    const estadoClase = estado_Id === 1 
                                        ? 'badge-outline-success hover:bg-success' 
                                        : estado_Id === 2 
                                        ? 'badge-outline-danger hover:bg-danger' 
                                        : '';
                                
                                    const estadoTexto = estado_Id === 1 ? 'Activo' : 'Inactivo';
                                
                                    return (
                                        <div className={`badge flex justify-center items-center rounded-full capitalize hover:top-0 hover:text-white ${estadoClase}`}>
                                            {estadoTexto}
                                        </div>
                                    );
                                }
                            },
                            {
                                accessor: 'action',
                                title: 'Acciones',
                                titleClassName: '!text-center',
                                render: (row: any) => (
                                    <div className="mx-auto flex w-max items-center gap-2">
                                        <button
                                            className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                                            onClick={() => {
                                                addEditData(row);
                                            }}
                                            title="Editar cuenta"
                                        >
                                            <i className="fa-solid fa-pencil text-white"></i>
                                        </button>
                                        <button
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'} transition-colors`}
                                            onClick={() => {
                                                row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                            }}
                                            title={row.estado_Id === 1 ? 'Desactivar cuenta' : 'Activar cuenta'}
                                        >
                                            <i className={`${row.estado_Id === 1 ? 'fa-regular fa-trash-can' : 'fa-solid fa-check'} text-white`}></i>
                                        </button>
                                    </div>
                                )
                            },
                        ]}
                        totalRecords={initialRecords?.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Mostrando ${from} a ${to} de ${totalRecords} cuentas`}
                    />
                </div>
            </div>
            <SaveCatalogoCuentaContablesModal
                addCatalogoCuentasModal={addCatalogoCuentasModal}
                setAddCatalogoCuentasModal={setAddCatalogoCuentasModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fetchCatalogoCuentas={fetchCatalogoCuentas}
                catalogoCuentasDefault={catalogoCuentasDefault}
            />
        </>
    );
};

export default CatalogoCuentasContables;