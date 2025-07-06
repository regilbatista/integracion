import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import AsyncSelect from 'react-select/async';
import {showMessage} from '@/utils/notifications'
import { apiGet, apiPost, apiPatch } from '@/lib/api/admin';

const selectDefault: {
    value: number;
    label: string;
}[] = [];

const SaveEntradasContableModal = (props: any) => {
    const { addEntradasContablesModal, setAddEntradasContablesModal, setSaveParams, saveParams, fetchEntradasContables, entradasContablesDefault } = props;
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = ['descripcion', 'cuenta_Id', 'tipoMovimiento', 'fechaAsiento', 'montoAsiento'];
    const [loading, setLoading] = useState(false);
    const [displayedCuentas, setDisplayedCuentas] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const [displayedAuxiliares, setDisplayedAuxiliares] = useState(JSON.parse(JSON.stringify(selectDefault)));
    
    const allCuentas: any = useRef([]);
    const allAuxiliares: any = useRef([]);

    useEffect (() => { 
        console.log(saveParams,'saveParams');
        if (addEntradasContablesModal) {
            loadCuentasTransaccionales();
            loadAuxiliares();
        }
    }, [saveParams, addEntradasContablesModal]);

    const loadCuentasTransaccionales = async () => {
        try {
            const response = await apiGet({ path: 'catalogoCuentas/transacciones' });
            if (response?.info) {
                allCuentas.current = response.info.filter((cuenta: any) => cuenta.estado_Id === 1);
                const cuentasFormatted = allCuentas.current.map((item: any) => ({
                    value: item.id,
                    label: `${item.descripcion} (${item.TiposCuentum?.descripcion || ''})`,
                }));
                setDisplayedCuentas(cuentasFormatted);
            } else if (response && Array.isArray(response)) {
                // Si la respuesta directa es un array
                allCuentas.current = response.filter((cuenta: any) => cuenta.estado_Id === 1);
                const cuentasFormatted = allCuentas.current.map((item: any) => ({
                    value: item.id,
                    label: `${item.descripcion} (${item.TiposCuentum?.descripcion || ''})`,
                }));
                setDisplayedCuentas(cuentasFormatted);
            }
        } catch (error) {
            console.error('Error loading cuentas:', error);
        }
    };

    const loadAuxiliares = async () => {
        try {
            const response = await apiGet({ path: 'auxiliares' });
            if (response?.info) {
                allAuxiliares.current = response.info.filter((aux: any) => aux.estado_Id === 1);
                const auxiliaresFormatted = allAuxiliares.current.map((item: any) => ({
                    value: item.id,
                    label: item.nombre,
                }));
                setDisplayedAuxiliares(auxiliaresFormatted);
            } else if (response && Array.isArray(response)) {
                // Si la respuesta directa es un array
                allAuxiliares.current = response.filter((aux: any) => aux.estado_Id === 1);
                const auxiliaresFormatted = allAuxiliares.current.map((item: any) => ({
                    value: item.id,
                    label: item.nombre,
                }));
                setDisplayedAuxiliares(auxiliaresFormatted);
            }
        } catch (error) {
            console.error('Error loading auxiliares:', error);
        }
    };

    const promiseOptionsCuentas = async (inputValue: string = '') => {
        let result = allCuentas.current;

        if (inputValue !== '') {
            result = result.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        }

        return result.map((item: any) => ({
            value: item.id,
            label: `${item.descripcion} (${item.TiposCuentum?.descripcion || ''})`,
        }));
    };

    const promiseOptionsAuxiliares = async (inputValue: string = '') => {
        let result = allAuxiliares.current;

        if (inputValue !== '') {
            result = result.filter((item: any) => {
                return item.nombre.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        }

        return result.map((item: any) => ({
            value: item.id,
            label: item.nombre,
        }));
    };

    const changeValue = (e: any) => {
        const { value, id, type } = e.target;
        let finalValue = value;

        if (type === 'number') {
            finalValue = parseFloat(value) || 0;
        }

        setSaveParams({ ...saveParams, [id]: finalValue });
    };

    const checkErrors = () => {
        const emptyList = errorValidation(errorsTags, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const saveEntradasContables = async () => {
       try {
            saveParams.estado_Id = 1;
            setLoading(true);
            const errorsCount = checkErrors();
            
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({msg: 'Por favor complete el formulario correctamente', type: 'error'});
            }

            // Validaciones adicionales
            if (!saveParams.cuenta_Id) {
                setLoading(false);
                return showMessage({msg: 'Debe seleccionar una cuenta contable', type: 'error'});
            }

            if (!['DB', 'CR'].includes(saveParams.tipoMovimiento)) {
                setLoading(false);
                return showMessage({msg: 'El tipo de movimiento debe ser Débito (DB) o Crédito (CR)', type: 'error'});
            }

            if (parseFloat(saveParams.montoAsiento) <= 0) {
                setLoading(false);
                return showMessage({msg: 'El monto debe ser mayor a cero', type: 'error'});
            }

            const dataToSend = {
                descripcion: saveParams.descripcion,
                auxiliar_Id: saveParams.auxiliar_Id || null,
                cuenta_Id: saveParams.cuenta_Id,
                tipoMovimiento: saveParams.tipoMovimiento,
                fechaAsiento: saveParams.fechaAsiento,
                montoAsiento: parseFloat(saveParams.montoAsiento),
                estado_Id: saveParams.estado_Id
            };

            if (saveParams.id) {
                // Actualizar entrada
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'entradasContables', data: dataToSend, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    const errorMsg = resp?.info?.[0]?.error || 'Error al actualizar la entrada contable';
                    showMessage({msg: errorMsg, type:'error'});
                } else {
                    fetchEntradasContables();
                    showMessage({msg:'Entrada contable actualizada exitosamente', type: 'success'});
                    close();
                }

            } else {
                // Insertar nueva entrada
                const resp = await apiPost({ path: 'entradasContables', data: dataToSend });
                const id = resp?.info?.[0]?.id ?? null;
                const errorMsg = resp?.info?.[0]?.error ?? null;
                
                if (id === null || errorMsg) {
                    setLoading(false);
                    showMessage({msg: errorMsg || 'Error al crear la entrada contable', type:'error'});
                } else {
                    fetchEntradasContables();
                    showMessage({msg:'Entrada contable creada exitosamente', type: 'success'});
                    close();
                }
            }
        } catch (error) {
            console.error(error);
            showMessage({msg:'Ocurrió un error al guardar la entrada contable', type:'error'});
        } finally {
            setLoading(false);
        }
    }

    const onChangeCuenta = (newValue: any) => {
        setSaveParams({ ...saveParams, cuenta_Id: newValue.value });
    };

    const onChangeAuxiliar = (newValue: any) => {
        setSaveParams({ ...saveParams, auxiliar_Id: newValue ? newValue.value : null });
    };

    const close = () => {
        setErrors([]);
        setAddEntradasContablesModal(false);
        setSaveParams(JSON.parse(JSON.stringify(entradasContablesDefault)));
    }

    return (
        <Transition appear show={addEntradasContablesModal} as={Fragment}>
            <Dialog
                as="div"
                open={addEntradasContablesModal}
                onClose={() => {
                    close();
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
                            <Dialog.Panel
                                className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar Entrada Contable' : 'Nueva Entrada Contable'}
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

                                <div className="p-5">
                                    <form>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                            <div className={`mb-5 ${errors.includes('descripcion') ? 'has-error' : ''}`}>
                                                <label htmlFor="descripcion" className="form-label flex">
                                                    Descripción *
                                                </label>
                                                <input
                                                    id="descripcion"
                                                    type="text"
                                                    placeholder="Ingrese la descripción de la entrada"
                                                    className="form-input"
                                                    value={saveParams.descripcion}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('fechaAsiento') ? 'has-error' : ''}`}>
                                                <label htmlFor="fechaAsiento" className="form-label flex">
                                                    Fecha del Asiento *
                                                </label>
                                                <input
                                                    id="fechaAsiento"
                                                    type="date"
                                                    className="form-input"
                                                    value={saveParams.fechaAsiento}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('cuenta_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="cuenta_Id" className="form-label flex">
                                                    Cuenta Contable *
                                                </label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions={displayedCuentas.length > 0 ? displayedCuentas : true}
                                                    value={displayedCuentas.find((i: any) => i.value === saveParams.cuenta_Id) || null}
                                                    loadOptions={promiseOptionsCuentas}
                                                    onChange={(newValue: any) => onChangeCuenta(newValue)}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona una cuenta"
                                                    noOptionsMessage={() => "No se encontraron cuentas disponibles"}
                                                />
                                            </div>

                                            <div className={`custom-select css-b62m3t-container mb-5`}>
                                                <label htmlFor="auxiliar_Id" className="form-label flex">
                                                    Auxiliar (Opcional)
                                                </label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions={displayedAuxiliares.length > 0 ? displayedAuxiliares : true}
                                                    isClearable
                                                    value={displayedAuxiliares.find((i: any) => i.value === saveParams.auxiliar_Id) || null}
                                                    loadOptions={promiseOptionsAuxiliares}
                                                    onChange={(newValue: any) => onChangeAuxiliar(newValue)}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un auxiliar (opcional)"
                                                    noOptionsMessage={() => "No se encontraron auxiliares"}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('tipoMovimiento') ? 'has-error' : ''}`}>
                                                <label htmlFor="tipoMovimiento" className="form-label flex">
                                                    Tipo de Movimiento *
                                                </label>
                                                <select
                                                    id="tipoMovimiento"
                                                    className="form-input"
                                                    value={saveParams.tipoMovimiento}
                                                    onChange={(e) => changeValue(e)}
                                                >
                                                    <option value="">Seleccione el tipo</option>
                                                    <option value="DB">Débito (DB)</option>
                                                    <option value="CR">Crédito (CR)</option>
                                                </select>
                                            </div>

                                            <div className={`mb-5 ${errors.includes('montoAsiento') ? 'has-error' : ''}`}>
                                                <label htmlFor="montoAsiento" className="form-label flex">
                                                    Monto del Asiento *
                                                </label>
                                                <input
                                                    id="montoAsiento"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    placeholder="0.00"
                                                    className="form-input"
                                                    value={saveParams.montoAsiento || ''}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                    close();
                                                }}
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="button"
                                                className={`btn btn-primary gap-2 ltr:ml-4 rtl:mr-4 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                onClick={() => saveEntradasContables()}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-l-transparent align-middle ltr:mr-4 rtl:ml-4"></span>
                                                        {saveParams.id ? 'Actualizando...' : 'Guardando...'}
                                                    </>
                                                ) : saveParams.id ? (
                                                    <>
                                                        <i className="fa-solid fa-edit"></i>
                                                        Actualizar
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-solid fa-save"></i>
                                                        Guardar
                                                    </>
                                                )}
                                            </button>
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

export default SaveEntradasContableModal;