import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import AsyncSelect from 'react-select/async';
import Tippy from '@tippyjs/react';
import dynamic from 'next/dynamic';
import { split } from 'lodash';
import InputMask from 'react-input-mask';
import { showMessage } from '@/utils/notifications';
import { validaCedula } from '@/utils/utilities';
import { apiGet, apiPost, apiPatch } from '@/lib/api/main';
import { apiGet as getAdm } from '@/lib/api/admin';
import { useAuth } from '@/src/context/authContext';
import { permissionRequired } from '@/utils/auth';

const selectDefault: {
    value: number;
    label: string;
}[] = [];

const SaveInspeccionModal = (props: any) => {
    const { addInspectionModal, setAddInspectionModal, setSaveParams, saveParams, fentchInspection, inspectionDefault } = props;
    const { auth } = useAuth();
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = [
        'rentaDevolucion_Id',
        'vehiculo_Id',
        'cliente_Id',
        'tieneRalladuras',
        'cantidadCombustible',
        'tieneGomaRespuesta',
        'tieneGato',
        'tieneRoturasCristal',
        'estado_gomas',
        'fecha',
        'empleado_Id',
    ];
    const [loading, setLoading] = useState(false);
    const [displayedRent, setdisplayedRent] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const [displayedEmpleado, setdisplayedEmpleado] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const [displayedVehiculo, setdisplayedVehiculo] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const [displayedCliente, setdisplayedCliente] = useState(JSON.parse(JSON.stringify(selectDefault)));

    const today = new Date().toISOString().split('T')[0];
    //const [allUser, setAllUser] = useState<any>([]);

    let allRent: any = useRef(null);
    let allEmpleado: any = useRef(null);
    let allVehiculo: any = useRef(null);
    let allCliente: any = useRef(null);

    useEffect(() => {
        console.log(saveParams, 'saveParams');
    }, [saveParams]);

    const handleFechaRentaChange = (e: any) => {
        const newFechaRenta = e.target.value;

        if (newFechaRenta < today) {
            return showMessage({ msg: 'La fecha de renta no puede ser menor a hoy.', type: 'error' });
        }

        changeValue(e);
    };

    const handleEstadoGomasChange = (e: any) => {
        const { name, checked } = e.target;

        setSaveParams((prev: any) => ({
            ...prev,
            estado_gomas: {
                ...prev.estado_gomas,
                [name]: checked,
            },
        }));
    };

    const promiseOptionsRent = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allRent.current.filter((item: any) => {
                return item.Vehiculo?.descripcion?.toString().toLowerCase().includes(inputValue.toLowerCase()) || item.Cliente?.nombre?.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'inspeccion/rent' });
            result = response.info;
            allRent.current = result;
        }

        result = result.map((item: any) => {
            return {
                value: item.id,
                label: `${item.Vehiculo?.descripcion} |  ${item.Cliente?.nombre}`,
            };
        });

        setdisplayedRent(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };

    const promiseOptionsEmpleado = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allEmpleado.current.filter((item: any) => {
                return item.nombre.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await getAdm({ path: 'empleados' });
            result = response.info;
            allEmpleado.current = result;
        }

        result = result.map((item: any) => {
            return {
                value: item.id,
                label: item.nombre,
            };
        });

        setdisplayedEmpleado(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };
    const promiseOptionsVehiculo = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allVehiculo.current.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await getAdm({ path: 'vehiculos' });
            result = response.info;
            allVehiculo.current = result;
        }

        result = result.map((item: any) => {
            return {
                value: item.id,
                label: item.descripcion,
            };
        });

        setdisplayedVehiculo(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };

    const promiseOptionsCliente = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allCliente.current.filter((item: any) => {
                return item.nombre.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'clientes' });
            result = response.info;
            allCliente.current = result;
        }

        result = result.map((item: any) => {
            return {
                value: item.id,
                label: item.nombre,
            };
        });

        setdisplayedCliente(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        let xvalue = null;
        xvalue = value === 'true' ? true : value === 'false' ? false : value;
        setSaveParams({ ...saveParams, [id]: xvalue });
    };

    const checkErrors = () => {
        const emptyList = errorValidation(errorsTags, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const handleBlur = () => {
        setErrors((prevErrors) => {
            if (!validaCedula(saveParams.cedula)) {
                return Array.from(new Set([...prevErrors, 'cedula'])); // Convierte el Set a Array
            } else {
                return prevErrors.filter((error) => error !== 'cedula'); // Remueve si es válida
            }
        });
    };

    const saveInspection = async () => {
        try {
            setLoading(true);
            const errorsCount = checkErrors();
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({ msg: 'Please complete the form', type: 'error' });
            }
            if (saveParams.id) {
                // Update task
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'inspeccion', data: saveParams, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    // Added optional chaining
                    showMessage({ msg: 'Error saving ticket', type: 'error' });
                } else {
                    fentchInspection();
                    close();
                }
            } else {
                // Insert task
                const resp = await apiPost({ path: 'inspeccion', data: saveParams });
                const id = resp?.info?.[0]?.id ?? null; // Added optional chaining and nullish coalescing

                if (id === null) {
                    setLoading(false);
                    showMessage({ msg: 'Error saving the Item', type: 'error' });
                } else {
                    fentchInspection();
                    showMessage({ msg: 'The Item has been saved successfully.' });
                    close();
                }
            }

            // refreshTasks();
        } catch (error) {
            console.error(error);
            showMessage({ msg: 'An error occurred while saving the task', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const onChangeValue = (newValue: any, input: string) => {
        if (input === 'rentaDevolucion_Id') setSaveParams({ ...saveParams, rentaDevolucion_Id: newValue.value });
        if (input === 'empleado_Id') setSaveParams({ ...saveParams, empleado_Id: newValue.value });
        if (input === 'vehiculo_Id') setSaveParams({ ...saveParams, vehiculo_Id: newValue.value });
        if (input === 'cliente_Id') setSaveParams({ ...saveParams, cliente_Id: newValue.value });
        if (input === 'modelo_Id') setSaveParams({ ...saveParams, modelo_Id: newValue.value });
    };

    const close = () => {
        setAddInspectionModal(false);
        setSaveParams(inspectionDefault);
    };

    return (
        <Transition appear show={addInspectionModal} as={Fragment}>
            <Dialog
                as="div"
                open={addInspectionModal}
                onClose={() => {
                    close();
                    //     setRemote(false);
                }}
                className="relative z-50"
            >
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* ${auth.permissions.includes('sys-adm') || auth.permissions.includes('it-access') ? 'w-full max-w-[100%]  md:w-[70%] lg:w-[950px]' : 'w-full max-w-lg'} */}
                            <Dialog.Panel
                                className={`panel 
                            w-full max-w-lg
                             overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark`}
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar inspeccion' : 'Añadir inspeccion'}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            close();
                                        }}
                                        className="text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-5 ">
                                    <form>
                                        <div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('rentaDevolucion_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="rentaDevolucion_Id" className="form-label flex">
                                                    Renta
                                                </label>
                                                <AsyncSelect //Category
                                                    cacheOptions
                                                    defaultOptions
                                                    //isDisabled={!permissionRequired(['admin'], auth.permissions || []) }
                                                    value={displayedRent.filter((i: any) => i.value == saveParams.rentaDevolucion_Id)[0]}
                                                    loadOptions={promiseOptionsRent}
                                                    onChange={(newValue: any) => onChangeValue(newValue, 'rentaDevolucion_Id')}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona una renta"
                                                />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('empleado_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="empleado_Id" className="form-label flex">
                                                    Empleado
                                                </label>
                                                <AsyncSelect //Category
                                                    cacheOptions
                                                    defaultOptions
                                                    //isDisabled={!permissionRequired(['admin'], auth.permissions || []) }
                                                    value={displayedEmpleado.filter((i: any) => i.value == saveParams.empleado_Id)[0]}
                                                    loadOptions={promiseOptionsEmpleado}
                                                    onChange={(newValue: any) => onChangeValue(newValue, 'empleado_Id')}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un Empleado"
                                                />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('vehiculo_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="vehiculo_Id" className="form-label flex">
                                                    Vehiculo
                                                </label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions
                                                    value={displayedVehiculo.filter((i: any) => i.value == saveParams.vehiculo_Id)[0]}
                                                    loadOptions={promiseOptionsVehiculo}
                                                    onChange={(newValue: any) => onChangeValue(newValue, 'vehiculo_Id')}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un Vehiculo"
                                                />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('cliente_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="cliente_Id" className="form-label flex">
                                                    Cliente
                                                </label>
                                                <AsyncSelect //Category
                                                    cacheOptions
                                                    defaultOptions
                                                    value={displayedCliente.filter((i: any) => i.value == saveParams.cliente_Id)[0]}
                                                    loadOptions={promiseOptionsCliente}
                                                    onChange={(newValue: any) => onChangeValue(newValue, 'cliente_Id')}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un cliente"
                                                />
                                            </div>

                                            <div className="mb-5 flex w-full flex-row gap-4">
                                                {/* Tiene Ralladuras */}
                                                <div className="flex-1">
                                                    <label htmlFor="tieneRalladuras">¿Tiene ralladuras?</label>
                                                    <select
                                                        id="tieneRalladuras"
                                                        name="tieneRalladuras"
                                                        className="form-select w-full rounded border p-2"
                                                        value={saveParams.tieneRalladuras}
                                                        onChange={(e: any) => changeValue(e)}
                                                    >
                                                        <option value="true">Sí</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>

                                                {/* Cantidad de Combustible */}
                                                <div className="flex-1">
                                                    <label htmlFor="cantidadCombustible">Cantidad de Combustible</label>
                                                    <select
                                                        id="cantidadCombustible"
                                                        name="cantidadCombustible"
                                                        className="form-select w-full rounded border p-2"
                                                        value={saveParams.cantidadCombustible}
                                                        onChange={(e: any) => changeValue(e)}
                                                    >
                                                        <option value="1/4">1/4</option>
                                                        <option value="1/2">1/2</option>
                                                        <option value="3/4">3/4</option>
                                                        <option value="Lleno">Lleno</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-5 flex w-full flex-row gap-4">
                                                {/* Tiene Goma de Respuesta */}
                                                <div className="flex-1">
                                                    <label htmlFor="tieneGomaRespuesta">¿Tiene goma de respuesta?</label>
                                                    <select
                                                        id="tieneGomaRespuesta"
                                                        name="tieneGomaRespuesta"
                                                        className="form-select w-full rounded border p-2"
                                                        value={saveParams.tieneGomaRespuesta}
                                                        onChange={(e: any) => changeValue(e)}
                                                    >
                                                        <option value="true">Sí</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>

                                                {/* Tiene Roturas en Cristal */}
                                                <div className="flex-1">
                                                    <label htmlFor="tieneRoturasCristal">¿Tiene roturas en el cristal?</label>
                                                    <select
                                                        id="tieneRoturasCristal"
                                                        name="tieneRoturasCristal"
                                                        className="form-select w-full rounded border p-2"
                                                        value={saveParams.tieneRoturasCristal}
                                                        onChange={(e: any) => changeValue(e)}
                                                    >
                                                        <option value="true">Sí</option>
                                                        <option value="false">No</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className={`mb-5 ${errors.includes('Comentario') ? 'has-error' : ''}`}>
                                                <label htmlFor="tieneGato">¿Tiene gato?</label>
                                                <select
                                                    id="tieneGato"
                                                    name="tieneGato"
                                                    className="form-select w-full rounded border p-2"
                                                    value={saveParams.tieneGato}
                                                    onChange={(e: any) => changeValue(e)}
                                                >
                                                    <option value="true">Sí</option>
                                                    <option value="false">No</option>
                                                </select>
                                            </div>
                                            <div className="mb-5">
                                                <label className="block font-semibold">Estado de las Gomas</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Delantera Izquierda */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            id="delantera_izq"
                                                            name="delantera_izq"
                                                            checked={saveParams.estado_gomas?.delantera_izq}
                                                            onChange={handleEstadoGomasChange}
                                                        />
                                                        <label htmlFor="delantera_izq">Delantera Izquierda</label>
                                                    </div>

                                                    {/* Delantera Derecha */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            id="delantera_der"
                                                            name="delantera_der"
                                                            checked={saveParams.estado_gomas?.delantera_der}
                                                            onChange={handleEstadoGomasChange}
                                                        />
                                                        <label htmlFor="delantera_der">Delantera Derecha</label>
                                                    </div>

                                                    {/* Trasera Izquierda */}
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" className="form-checkbox" id="trasera_izq" name="trasera_izq" checked={saveParams.estado_gomas?.trasera_izq} onChange={handleEstadoGomasChange} />
                                                        <label htmlFor="trasera_izq">Trasera Izquierda</label>
                                                    </div>

                                                    {/* Trasera Derecha */}
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" className="form-checkbox" id="trasera_der" name="trasera_der" checked={saveParams.estado_gomas?.trasera_der} onChange={handleEstadoGomasChange} />
                                                        <label htmlFor="trasera_der">Trasera Derecha</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`mb-5 ${errors.includes('fecha') ? 'has-error' : ''}`}>
                                                <label htmlFor="fecha">Fecha</label>
                                                <input
                                                    id="fecha"
                                                    type="date"
                                                    name="fecha"
                                                    className={`form-input w-full rounded border p-2`}
                                                    value={split(saveParams.fecha, 'T')[0]}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => {
                                                        close();
                                                    }}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`btn btn-success gap-2 ltr:ml-4 rtl:mr-4 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    onClick={() => saveInspection()}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-l-transparent align-middle ltr:mr-4 rtl:ml-4"></span>
                                                            {saveParams.id ? 'Update' : 'Add'}
                                                        </>
                                                    ) : saveParams.id ? (
                                                        'Update'
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-floppy-disk"></i>
                                                            {'Add'}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default SaveInspeccionModal;
