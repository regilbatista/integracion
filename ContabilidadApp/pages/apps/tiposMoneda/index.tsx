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
import SaveTiposMonedaModal from '@/components/pages/tiposMoneda/saveTiposMonedaModal';

const PATH = 'tiposMoneda';

const tiposMonedaDefault = {
    id: null,
    descripcion: '',
    ultimaTasaCambiaria: null,
    estado_Id: 1,
};

const TiposMoneda = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        fetchTiposMoneda();
        dispatch(setPageTitle('Tipos de Moneda'));
    }, []);

    const fetchTiposMoneda = async () => {
        try {
            const response = await apiGet({ path: 'tiposMoneda' });
            setInitialRecords(sortBy(response?.info || response, 'id'));
        } catch (error) {
            console.error('Error fetching currency types:', error);
            showMessage({ msg: 'Error al cargar los tipos de moneda', type: 'error' });
        }
    }

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(tiposMonedaDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [isEdit, setIsEdit] = useState<any>(false);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addTiposMonedaModal, setAddTiposMonedaModal] = useState<any>(false);
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
                    item.ultimaTasaCambiaria?.toString().includes(search) ||
                    item.id?.toString().includes(search)
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
            setIsEdit(true);
            setSaveParams(row);
        } else {
            setSaveParams(tiposMonedaDefault);
        }
        setAddTiposMonedaModal(true);
    };

    const deleteItem = async (row: any) => {
        try {
            const resp = await apiDelete({ path: 'tiposMoneda', id: row.id });
            let message = {};

            if (resp?.info?.[0]?.msg !== 'ok') {
                message = { msg: 'Error al cambiar el estado del registro', type: 'error' };
            } else {
                const action = resp?.info?.[0]?.action || 'updated';
                const actionText = action === 'activated' ? 'activado' : 'desactivado';
                message = { msg: `Registro ${actionText} exitosamente` };
                fetchTiposMoneda();
            }

            showMessage(message);
        } catch (error) {
            console.error('Error deleting currency type:', error);
            showMessage({ msg: 'Error al procesar la solicitud', type: 'error' });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-DO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        }).format(value);
    };

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Tipos de Moneda</h5>
                    <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button 
                                type="button" 
                                onClick={() => addEditData()} 
                                className="btn btn-secondary"
                            >
                                Añadir Tipo de Moneda
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
                                accessor: 'ultimaTasaCambiaria', 
                                title: 'Última Tasa Cambiaria', 
                                sortable: true,
                                render: ({ ultimaTasaCambiaria }) => (
                                    <div className="text-right">
                                        {formatCurrency(ultimaTasaCambiaria)}
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
                                                const actionText = row.estado_Id === 1 ? 'desactivar' : 'activar';
                                                const confirmMessage = `¿Está seguro que desea ${actionText} este tipo de moneda?`;
                                                
                                                row.estado_Id === 1 
                                                    ? showConfirm(() => deleteItem(row), confirmMessage) 
                                                    : deleteItem(row);
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
                        paginationText={({ from, to, totalRecords }) => `Mostrando ${from} a ${to} de ${totalRecords} entradas`}
                    />
                </div>
            </div>
            <SaveTiposMonedaModal
                addTiposMonedaModal={addTiposMonedaModal}
                setAddTiposMonedaModal={setAddTiposMonedaModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fetchTiposMoneda={fetchTiposMoneda}
                tiposMonedaDefault={tiposMonedaDefault}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
            />
        </>
    );
};

export default TiposMoneda;