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
import SaveUsersModal from '@/components/pages/users/saveUsersModal';

const PATH = 'users';

const usersDefault = {
    id: null,
    usuario: '', // Cambiado de 'user' a 'usuario' según el endpoint
    password: '',
    confirmPassword: '',
    rol_Id: '',
    estado_Id: 1,
};

const Users = () => {

    useEffect(() => {
        fetchUsers();
    },[]);

    const fetchUsers = async () => {
        const response = await apiGet({ path: 'users' });
        setInitialRecords(sortBy(response?.info, 'id'))
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Gestión de Usuarios'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(usersDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addUsersModal, setAddUsersModal] = useState<any>(false);
    const [isEdit, setIsEdit] = useState<any>(false);
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
                    item.usuario?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.rol_Id?.toString().toLowerCase().includes(search.toLowerCase())
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
            // Crear una copia para edición sin incluir datos sensibles
            const editData = {
                id: row.id,
                usuario: row.usuario,
                rol_Id: row.rol_Id,
                estado_Id: row.estado_Id,
                password: '',
                confirmPassword: ''
            };
            setSaveParams(editData);
        } else {
            setIsEdit(false);
            setSaveParams(JSON.parse(JSON.stringify(usersDefault)));
        }
        setAddUsersModal(true);
    };

    const deleteItem = async (row: any) => {
        const resp = await apiDelete({ path: 'users', data: saveParams, id: row.id });
        let message = {};

        if (resp.info[0]?.msg !== 'ok') {
            message = { msg: 'Error al cambiar estado del usuario', type: 'error' };
        } else {
            const action = resp.info[0]?.action || 'updated';
            message = { 
                msg: action === 'activated' ? 'Usuario activado' : 'Usuario desactivado',
                type: 'success'
            };
            fetchUsers();
        }

        showMessage(message);
    };

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Gestión de Usuarios</h5>
                    <div className="flex w-full flex-col items-center gap-5 md:w-auto md:flex-row ltr:ml-auto rtl:mr-auto">
                        <div className="flex w-full flex-col gap-5 md:w-auto md:flex-row md:items-center">
                            <button type="button" 
                                onClick={() => addEditData()} 
                                className="btn btn-primary" >
                                    <i className="fa-solid fa-plus mr-2"></i>
                                    Añadir Usuario
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Buscar usuario o rol..." 
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
                            { accessor: 'usuario', title: 'Usuario', sortable: true },
                            { 
                                accessor: 'rol_Id', 
                                title: 'Rol', 
                                sortable: true,
                                render: ({ rol_Id }) => (
                                    <div className={`badge ${rol_Id === 'admin' ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-full px-3 py-1 flex justify-center items-center`}>
                                        {rol_Id}
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
                                            title="Editar usuario"
                                        >
                                            <i className="fa-solid fa-pencil text-white"></i>
                                        </button>
                                        <button
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'} transition-colors`}
                                            onClick={() => {
                                                row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                            }}
                                            title={row.estado_Id === 1 ? 'Desactivar usuario' : 'Activar usuario'}
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
                        paginationText={({ from, to, totalRecords }) => `Mostrando ${from} a ${to} de ${totalRecords} usuarios`}
                    />
                </div>
            </div>
            <SaveUsersModal
                addUsersModal={addUsersModal}
                setAddUsersModal={setAddUsersModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fetchUsers={fetchUsers}
                usersDefault={usersDefault}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
            />
        </>
    );
};

export default Users;