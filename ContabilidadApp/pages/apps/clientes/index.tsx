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
import SaveClientesModal from '@/components/pages/clientes/saveClientesModal';

const PATH = 'clientes';

const customersDefault = {
    id: null,
    nombre: '',
    cedula: '',
    NoTarjetaCR: '',
    limiteCredito: null,
    tipoPersona: '',
    estado_Id: 1,
    
};

const Clientes = () => {


    useEffect(() => {
        fentchCustomers();
        //-setProjects(projects.info);
    },[]);


       const fentchCustomers = async ()  =>{
        const emp = await apiGet({ path: 'clientes' });
        setInitialRecords(sortBy(emp?.info, 'id'))

       }
        const dispatch = useDispatch();
        useEffect(() => {
            dispatch(setPageTitle('Order Sorting Table'));
        });
        const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    
        const [page, setPage] = useState(1);
        const PAGE_SIZES = [10, 20, 30, 50, 100];
        const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(customersDefault)));
        const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
        const [initialRecords, setInitialRecords] = useState<any>([]);
        const [recordsData, setRecordsData] = useState<any>(initialRecords);
        const [addCustomersModal,setAddCustomersModal] = useState<any> (false);
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
                        item.nombre?.toString().toLowerCase().includes(search.toLowerCase()) ||
                        item.cedula?.toLowerCase().includes(search.toLowerCase()) ||
                        item.NoTarjetaCR?.toLowerCase().includes(search.toLowerCase()) ||
                        item.tipoPersona?.toLowerCase().includes(search.toLowerCase())
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
            }
            setAddCustomersModal(true);
        };

        const deleteItem = async (row: any) => {
            const resp = await apiDelete({ path: 'clientes', data: saveParams, id: row.id });
            let message = {};
    
            if (resp.info[0]?.msg !== 'ok') {
                message = { msg: 'Error deleting register', type: 'error' };
            } else {
                message = { msg: 'Register has been Deleted' };
    
               fentchCustomers();
            }
    
            showMessage(message);
        };
    

        return (
            <>
                <div className="panel">
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Clientes</h5>
                        <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button type="button" 
                                onClick={() => addEditData()} 
                            className="btn btn-secondary" >
                                    Añadir
                            </button>
                        </div>
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true },
                                { accessor: 'nombre', title: 'Nombre', sortable: true },
                                { accessor: 'cedula', title: 'Cedula', sortable: true },
                                { accessor: 'NoTarjetaCR', title: 'Tarjeta', sortable: true },
                                { accessor: 'limiteCredito', title: 'Limite', sortable: true },
                                { accessor: 'tipoPersona', title: 'Tipo de persona', sortable: true },
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
                                    title: 'Action',
                                    titleClassName: '!text-center',
                                    render: (row: any) => (
                                        <div className="mx-auto flex w-max items-center gap-2">
                                            <button
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                                                onClick={() => {
                                                    addEditData(row);
                                                }}
                                            >
                                                <i className="fa-solid fa-pencil text-white"></i>
                                            </button>
                                            <button
                                                className={`w-10 h-10 flex items-center justify-center rounded-full ${row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'} transition-colors`}
                                                onClick={() => {
                                                    row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                                }}
                                            >
                                                <i className={` ${row.estado_Id === 1 ? 'fa-regular fa-trash-can' : 'fa-solid fa-check' } text-white`}></i>
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
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
                <SaveClientesModal
                    addCustomersModal={addCustomersModal}
                    setAddCustomersModal={setAddCustomersModal}
                    saveParams={saveParams}
                    setSaveParams={setSaveParams}
                    fentchCustomers={fentchCustomers}
                    customersDefault={customersDefault}
                />
            </>
        );
 
};

export default Clientes;