import Link from 'next/link';
import sortBy from 'lodash/sortBy';
import { NextPageContext } from 'next';
import { IRootState } from '../../../store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { showMessage, showConfirm } from '@/utils/notifications';
import { formatDateTime } from '@/utils/utilities';
import { apiGet, apiDelete } from '@/lib/api/main';
import SaveRentaDevolucionModal from '@/components/pages/rentaDevolucion/saveRentaDevolucionModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const rentdevolutionDefault = {
    id: null,
    empleado_Id: null,
    vehiculo_Id: null,
    cliente_Id: null,
    FechaRenta: null,
    FechaDevolucion: null,
    MontoPorDia: null,
    CantidadDias: null,
    Comentario: '',
    estado_Id: 1,
};

const RentaDevolucion = () => {
    useEffect(() => {
        fentchRentDevolution();
    }, []);

    const fentchRentDevolution = async () => {
        const emp = await apiGet({ path: 'rentadevolucion' });
        setInitialRecords(sortBy(emp?.info, 'id'));
    };
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Order Sorting Table'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [saveParams, setSaveParams] = useState<any>(JSON.parse(JSON.stringify(rentdevolutionDefault)));
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<any>([]);
    const [recordsData, setRecordsData] = useState<any>(initialRecords);
    const [addRentDevolutionModal, setAddRentDevolutionModal] = useState<any>(false);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [filterDateRenta, setFilterDateRenta] = useState('');
    const [filterDateDevolucion, setFilterDateDevolucion] = useState('');

    useEffect(() => {
        const filtered = recordsData.filter((record: any) => {
            const rentaMatch = filterDateRenta ? record.FechaRenta.startsWith(filterDateRenta) : true;
            const devolucionMatch = filterDateDevolucion ? record.FechaDevolucion.startsWith(filterDateDevolucion) : true;
            return rentaMatch && devolucionMatch;
        });

        setRecordsData(filtered);
    }, [filterDateRenta, filterDateDevolucion, recordsData]);

    const exportToPDF = () => {
        const doc: any = new jsPDF();

        // Título del documento
        doc.setFontSize(18);
        doc.text('Reporte de Renta y Devolución', 14, 15);

        // Definir columnas y filas para la tabla
        const columns = ['ID', 'Empleado', 'Vehículo', 'Cliente', 'Renta', 'Devolución', 'Monto/Día', 'Días', 'Total', 'Comentario', 'Estado'];
        const rows = recordsData.map((item: any) => [
            item.id,
            item.Empleado?.nombre || 'N/A',
            item.Vehiculo?.descripcion || 'N/A',
            item.Cliente?.nombre || 'N/A',
            formatDateTime(item.FechaRenta),
            formatDateTime(item.FechaDevolucion),
            `${item.MontoPorDia} $`,
            item.CantidadDias,
            `${item.MontoPorDia * item.CantidadDias} $`,
            item.Comentario || 'N/A',
            item.estado_Id === 1 ? 'Activo' : 'Inactivo',
        ]);

        // Generar tabla
        doc.autoTable({
            startY: 25,
            head: [columns],
            body: rows,
            styles: { fontSize: 10 },
        });

        // Descargar PDF
        doc.save('renta_devolucion.pdf');
    };

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
                    item.Empleado?.nombre?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.Cliente?.nombre?.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.Vehiculo?.descripcion?.toString().toLowerCase().includes(search.toLowerCase())
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
        setAddRentDevolutionModal(true);
    };

    const deleteItem = async (row: any) => {
        const resp = await apiDelete({ path: 'rentadevolucion', data: saveParams, id: row.id });
        let message = {};

        if (resp.info[0]?.msg !== 'ok') {
            message = { msg: 'Error deleting register', type: 'error' };
        } else {
            message = { msg: 'Register has been Deleted' };

            fentchRentDevolution();
        }

        showMessage(message);
    };

    return (
        <>
            <div className="panel">
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                    <h5 className="text-lg font-semibold dark:text-white-light">Rentadevolucion</h5>
                    <div className="flex w-full flex-col items-center gap-5 ltr:ml-auto rtl:mr-auto md:w-auto md:flex-row">
                        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-5">
                            <button className="btn btn-primary h-10 px-4" onClick={exportToPDF}>
                                Exportar a PDF
                            </button>
                            <button type="button" className="btn btn-secondary h-10 px-4" onClick={addEditData}>
                                Añadir
                            </button>
                        </div>
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-5">
                        <div className="flex flex-col items-center">
                            <label htmlFor="rentDate" className="text-sm font-medium">
                               <b> Fecha de Renta</b>
                            </label>
                            <input id="rentDate" type="date" className="form-input h-10 min-w-[180px] px-2" value={filterDateRenta} onChange={(e) => setFilterDateRenta(e.target.value)} />
                        </div>
                        <div className="flex flex-col items-center">
                            <label htmlFor="returnDate" className="text-sm font-medium">
                                <b>Fecha de Devolución</b>
                            </label>
                            <input id="returnDate" type="date" className="form-input h-10 min-w-[180px] px-2" value={filterDateDevolucion} onChange={(e) => setFilterDateDevolucion(e.target.value)} />
                        </div>
                        <button className="btn mt-6 btn-warning h-10 px-4" onClick={()=>{setFilterDateDevolucion(''); setFilterDateRenta(''); setRecordsData(initialRecords);}}>
                                limpiar filtros
                        </button>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                        records={recordsData}
                        columns={[
                            { accessor: 'id', title: 'ID', sortable: true },
                            { accessor: 'Empleado.nombre', title: 'Empleado', sortable: true },
                            { accessor: 'Vehiculo.descripcion', title: 'Vehiculo', sortable: true },
                            { accessor: 'Cliente.nombre', title: 'Cliente', sortable: true },
                            {
                                accessor: 'FechaRenta',
                                title: 'Renta',
                                sortable: true,
                                render: ({ FechaRenta }) => <div>{formatDateTime(FechaRenta)}</div>,
                            },
                            {
                                accessor: 'FechaDevolucion',
                                title: 'Devolucion',
                                sortable: true,
                                render: ({ FechaDevolucion }) => <div>{formatDateTime(FechaDevolucion)}</div>,
                            },
                            {
                                accessor: 'MontoPorDia',
                                title: 'MontoPorDia',
                                sortable: true,
                                render: ({ MontoPorDia }) => <div>{`${MontoPorDia} $`}</div>,
                            },
                            { accessor: 'CantidadDias', title: 'Cantidad de Dias', sortable: true },
                            {
                                accessor: 'total',
                                title: 'Total',
                                sortable: true,
                                render: ({ MontoPorDia, CantidadDias }) => <div>{`${MontoPorDia * CantidadDias} $`}</div>,
                            },
                            {
                                accessor: 'Comentario',
                                title: 'Comentario',
                                sortable: true,
                                render: ({ Comentario }) => (
                                    <div className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-white-dark sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[300px]">{`${Comentario}`}</div>
                                ),
                            },
                            {
                                accessor: 'estado_Id',
                                title: 'Estado',
                                sortable: true,
                                render: ({ estado_Id }) => {
                                    const estadoClase = estado_Id === 1 ? 'badge-outline-success hover:bg-success' : estado_Id === 2 ? 'badge-outline-danger hover:bg-danger' : '';

                                    const estadoTexto = estado_Id === 1 ? 'Activo' : 'Inactivo';

                                    return <div className={`badge flex items-center justify-center rounded-full capitalize hover:top-0 hover:text-white ${estadoClase}`}>{estadoTexto}</div>;
                                },
                            },
                            {
                                accessor: 'action',
                                title: 'Action',
                                titleClassName: '!text-center',
                                render: (row: any) => (
                                    <div className="mx-auto flex w-max items-center gap-2">
                                        <button
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600"
                                            onClick={() => {
                                                addEditData(row);
                                            }}
                                        >
                                            <i className="fa-solid fa-pencil text-white"></i>
                                        </button>
                                        <button
                                            disabled={row.estado_Id === 2 ? true : false}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                row.estado_Id === 1 ? 'bg-red-500 hover:bg-red-600' : 'bg-lime-500 hover:bg-lime-600'
                                            } transition-colors`}
                                            onClick={() => {
                                                row.estado_Id === 1 ? showConfirm(() => deleteItem(row)) : deleteItem(row);
                                            }}
                                        >
                                            <i className={` ${row.estado_Id === 1 ? 'fa-regular fa-trash-can' : 'fa-solid fa-check'} text-white`}></i>
                                        </button>
                                    </div>
                                ),
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
            <SaveRentaDevolucionModal
                addRentDevolutionModal={addRentDevolutionModal}
                setAddRentDevolutionModal={setAddRentDevolutionModal}
                saveParams={saveParams}
                setSaveParams={setSaveParams}
                fentchRentDevolution={fentchRentDevolution}
                rentdevolutionDefault={rentdevolutionDefault}
            />
        </>
    );
};

export default RentaDevolucion;
