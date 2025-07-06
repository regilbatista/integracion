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
import { apiGet, apiDelete } from '@/lib/api/admin';
import SaveTiposCuentaModal from '@/components/pages/tiposCuenta/saveTiposCuentaModal';

const PATH = 'tiposCuenta';

const tiposCuentaDefault = {
    id: null,
    descripcion: '',
    origen: 'DB', // DB o CR
    estado_Id: 1,
};

const TiposCuenta = () => {

    useEffect(() => {
        fetchTiposCuenta();
    },[]);

    const fetchTiposCuenta = async ()  =>{
        const response = await apiGet({ path: 'tiposCuenta' });
        setInitialRecords(sortBy(response?.info, 'id'))
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Tipos de Cuenta'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(tiposCuentaDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addTiposCuentaModal, setAddTiposCuentaModal] = useState<any>(false);
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
                    item.origen?.toString().toLowerCase().includes(search.toLowerCase())
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
            setSaveParams(JSON.parse(JSON.stringify(tiposCuentaDefault)));
        }
        setAddTiposCuentaModal(true);
    };


const deleteItem = async (row: any) => {
    try {
        const resp = await apiDelete({ path: 'tiposCuenta', data: saveParams, id: row.id });
        let message = {};
        
        // Verificar si hay error en la respuesta
        if (resp.status === 400) {
            // El error está en resp.error.response.data
            const errorData = resp.error?.response?.data;
            
            if (errorData && Array.isArray(errorData) && errorData[0]?.error) {
                const errorMessage = errorData[0].error;
                
                // Personalizar mensaje para el error específico de cuentas activas
                if (errorMessage.includes('active accounts associated')) {
                    message = { 
                        msg: 'No se puede desactivar: este tipo de cuenta tiene cuentas contables activas asociadas. Desactive primero las cuentas relacionadas.',
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
                msg: action === 'activated' ? 'Tipo de cuenta activado' : 'Tipo de cuenta desactivado',
                type: 'success'
            };
            fetchTiposCuenta();
        } else {
            message = { 
                msg: 'Error desconocido al procesar la solicitud', 
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

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Tipos de Cuenta</h5>
                    <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button type="button" 
                                onClick={() => addEditData()} 
                                className="btn btn-primary" >
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Añadir Tipo de Cuenta
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Buscar..." 
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
                                accessor: 'origen',
                                title: 'Origen',
                                sortable: true,
                                render: ({ origen }) => (
                                    <div className={`badge ${origen === 'DB' ? 'bg-blue-500' : 'bg-green-500'} flex text-white rounded-full px-3 py-1 justify-center items-center`}>
                                        {origen === 'DB' ? 'Débito' : 'Crédito'}
                                    </div>
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
                                            title="Editar"
                                        >
                                            <i className="fa-solid fa-pencil text-white"></i>
                                        </button>
                                        <button
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'} transition-colors`}
                                            onClick={() => {
                                                row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                            }}
                                            title={row.estado_Id === 1 ? 'Desactivar' : 'Activar'}
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
                        paginationText={({ from, to, totalRecords }) => `Mostrando ${from} a ${to} de ${totalRecords} registros`}
                    />
                </div>
            </div>
            <SaveTiposCuentaModal
                addTiposCuentaModal={addTiposCuentaModal}
                setAddTiposCuentaModal={setAddTiposCuentaModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fetchTiposCuenta={fetchTiposCuenta}
                tiposCuentaDefault={tiposCuentaDefault}
            />
        </>
    );
};

export default TiposCuenta;