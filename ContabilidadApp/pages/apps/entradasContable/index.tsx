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
import SaveEntradasContableModal from '@/components/pages/entradasContable/saveEntradasContableModal';

const PATH = 'entradasContables';

const entradasContablesDefault = {
    id: null,
    descripcion: '',
    auxiliar_Id: null,
    cuenta_Id: null,
    tipoMovimiento: 'DB', // DB o CR
    fechaAsiento: new Date().toISOString().split('T')[0], // Fecha actual
    montoAsiento: 0,
    estado_Id: 1,
};

const EntradasContables = () => {

    useEffect(() => {
        fetchEntradasContables();
    },[]);

    const fetchEntradasContables = async () => {
        const response = await apiGet({ path: 'entradasContables' });
        setInitialRecords(sortBy(response?.info, 'fechaAsiento').reverse())
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Entradas Contables'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(entradasContablesDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addEntradasContablesModal, setAddEntradasContablesModal] = useState<any>(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'fechaAsiento',
        direction: 'desc',
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
                    item.CatalogoCuentasContable?.descripcion?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.Auxiliare?.nombre?.toString().toLowerCase().includes(search.toLowerCase())
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
            // Formatear la fecha para el input date
            const formattedRow = {
                ...row,
                fechaAsiento: row.fechaAsiento ? new Date(row.fechaAsiento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };
            setSaveParams(formattedRow);
        } else {
            setSaveParams(JSON.parse(JSON.stringify(entradasContablesDefault)));
        }
        setAddEntradasContablesModal(true);
    };

    const deleteItem = async (row: any) => {
        const resp = await apiDelete({ path: 'entradasContables', data: saveParams, id: row.id });
        let message = {};

        if (resp.info[0]?.msg !== 'ok') {
            const errorMsg = resp.info[0]?.error || 'Error al cambiar estado de la entrada';
            message = { msg: errorMsg, type: 'error' };
        } else {
            const action = resp.info[0]?.action || 'updated';
            message = { 
                msg: action === 'activated' ? 'Entrada contable activada' : 'Entrada contable desactivada',
                type: 'success'
            };
            fetchEntradasContables();
        }

        showMessage(message);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-DO');
    };

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Entradas Contables</h5>
                    <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button type="button" 
                                onClick={() => addEditData()} 
                                className="btn btn-primary" >
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Nueva Entrada
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Buscar por descripción, cuenta o auxiliar..." 
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
                            { 
                                accessor: 'fechaAsiento', 
                                title: 'Fecha', 
                                sortable: true,
                                render: ({ fechaAsiento }) => (
                                    <span className="text-sm">{formatDate(fechaAsiento)}</span>
                                )
                            },
                            { accessor: 'descripcion', title: 'Descripción', sortable: true },
                            {
                                accessor: 'CatalogoCuentasContable',
                                title: 'Cuenta',
                                sortable: false,
                                render: ({ CatalogoCuentasContable }) => (
                                    <div className="text-sm">
                                        <div className="font-medium">{CatalogoCuentasContable?.descripcion || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">
                                            Balance: {formatCurrency(parseFloat(CatalogoCuentasContable?.balance || 0))}
                                        </div>
                                    </div>
                                )
                            },
                            {
                                accessor: 'Auxiliare',
                                title: 'Auxiliar',
                                sortable: false,
                                render: ({ Auxiliare }) => (
                                    <span className="text-sm">{Auxiliare?.nombre || 'N/A'}</span>
                                )
                            },
                            {
                                accessor: 'tipoMovimiento',
                                title: 'Tipo',
                                sortable: true,
                                render: ({ tipoMovimiento }) => (
                                    <div className={`badge ${tipoMovimiento === 'DB' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded-full px-3 py-1`}>
                                        {tipoMovimiento === 'DB' ? 'Débito' : 'Crédito'}
                                    </div>
                                )
                            },
                            {
                                accessor: 'montoAsiento',
                                title: 'Monto',
                                sortable: true,
                                render: ({ montoAsiento, tipoMovimiento }) => (
                                    <span className={`font-medium ${tipoMovimiento === 'DB' ? 'text-blue-600' : 'text-green-600'}`}>
                                        {formatCurrency(parseFloat(montoAsiento || 0))}
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
                                            title="Editar entrada"
                                        >
                                            <i className="fa-solid fa-pencil text-white"></i>
                                        </button>
                                        <button
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'} transition-colors`}
                                            onClick={() => {
                                                row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                            }}
                                            title={row.estado_Id === 1 ? 'Desactivar entrada' : 'Activar entrada'}
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
            <SaveEntradasContableModal
                addEntradasContablesModal={addEntradasContablesModal}
                setAddEntradasContablesModal={setAddEntradasContablesModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fetchEntradasContables={fetchEntradasContables}
                entradasContablesDefault={entradasContablesDefault}
            />
        </>
    );
};

export default EntradasContables;