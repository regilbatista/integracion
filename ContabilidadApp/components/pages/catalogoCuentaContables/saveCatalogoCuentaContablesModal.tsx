import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import AsyncSelect from 'react-select/async';
import {showMessage} from '@/utils/notifications'
import { apiGet, apiPost, apiPatch } from '@/lib/api/main';
import { apiGet as getData } from '@/lib/api/admin';

const selectDefault: {
    value: number;
    label: string;
}[] = [];

const SaveCatalogoCuentaContablesModal = (props: any) => {
    const { addCatalogoCuentasModal, setAddCatalogoCuentasModal, setSaveParams, saveParams, fetchCatalogoCuentas, catalogoCuentasDefault } = props;
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = ['descripcion', 'tipoCuenta_Id', 'permiteTransacciones', 'nivel'];
    const [loading, setLoading] = useState(false);
    const [displayedTiposCuenta, setDisplayedTiposCuenta] = useState(JSON.parse(JSON.stringify(selectDefault)));
    const [displayedCuentasMayor, setDisplayedCuentasMayor] = useState(JSON.parse(JSON.stringify(selectDefault)));
    
    const allTiposCuenta: any = useRef([]);
    const allCuentasMayor: any = useRef([]);

    useEffect (() => { 
        console.log(saveParams,'saveParams');
        if (addCatalogoCuentasModal) {
            loadTiposCuenta();
            loadCuentasMayor();
        }
    }, [saveParams, addCatalogoCuentasModal]);

    const loadTiposCuenta = async () => {
        try {
            const response = await getData({ path: 'tiposCuenta' });
            if (response?.info) {
                allTiposCuenta.current = response.info.filter((tipo: any) => tipo.estado_Id === 1);
                const tiposFormatted = allTiposCuenta.current.map((item: any) => ({
                    value: item.id,
                    label: `${item.descripcion} (${item.origen === 'DB' ? 'Débito' : 'Crédito'})`,
                }));
                setDisplayedTiposCuenta(tiposFormatted);
            }
        } catch (error) {
            console.error('Error loading tipos de cuenta:', error);
        }
    };

    const loadCuentasMayor = async () => {
        try {
            const response = await apiGet({ path: 'catalogoCuentas' });
            if (response?.info) {
                // Solo mostrar cuentas de nivel 1 y 2 como opciones para cuenta mayor
                allCuentasMayor.current = response.info.filter((cuenta: any) => 
                    cuenta.estado_Id === 1 && cuenta.nivel < 3
                );
                const cuentasFormatted = allCuentasMayor.current.map((item: any) => ({
                    value: item.id,
                    label: `${item.descripcion} (Nivel ${item.nivel})`,
                }));
                setDisplayedCuentasMayor(cuentasFormatted);
            }
        } catch (error) {
            console.error('Error loading cuentas mayor:', error);
        }
    };

    const promiseOptionsTiposCuenta = async (inputValue: string) => {
        let result = allTiposCuenta.current;

        if (inputValue !== '') {
            result = result.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        }

        return result.map((item: any) => ({
            value: item.id,
            label: `${item.descripcion} (${item.origen === 'DB' ? 'Débito' : 'Crédito'})`,
        }));
    };

    const promiseOptionsCuentasMayor = async (inputValue: string) => {
        let result = allCuentasMayor.current;

        if (inputValue !== '') {
            result = result.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        }

        // Filtrar según el nivel seleccionado
        if (saveParams.nivel === 2) {
            result = result.filter((cuenta: any) => cuenta.nivel === 1);
        } else if (saveParams.nivel === 3) {
            result = result.filter((cuenta: any) => cuenta.nivel <= 2);
        }

        return result.map((item: any) => ({
            value: item.id,
            label: `${item.descripcion} (Nivel ${item.nivel})`,
        }));
    };

    const changeValue = (e: any) => {
        const { value, id, type, checked } = e.target;
        let finalValue = value;

        if (type === 'checkbox') {
            finalValue = checked;
        } else if (id === 'nivel') {
            finalValue = parseInt(value);
            // Limpiar cuenta mayor si cambia el nivel
            if (finalValue === 1) {
                setSaveParams({ ...saveParams, [id]: finalValue, cuentaMayor_Id: null });
                return;
            }
        }

        setSaveParams({ ...saveParams, [id]: finalValue });
    };

    const checkErrors = () => {
        let customErrors = [...errorsTags];
        
        // Validar cuenta mayor requerida para nivel 2 y 3
        if (saveParams.nivel > 1 && !saveParams.cuentaMayor_Id) {
            customErrors.push('cuentaMayor_Id');
        }

        const emptyList = errorValidation(customErrors, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const saveCatalogoCuentas = async () => {
       try {
            saveParams.estado_Id = 1;
            setLoading(true);
            const errorsCount = checkErrors();
            
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({msg: 'Por favor complete el formulario correctamente', type: 'error'});
            }

            // Validaciones adicionales
            if (saveParams.nivel < 1 || saveParams.nivel > 3) {
                setLoading(false);
                return showMessage({msg: 'El nivel debe estar entre 1 y 3', type: 'error'});
            }

            if (saveParams.nivel > 1 && !saveParams.cuentaMayor_Id) {
                setLoading(false);
                return showMessage({msg: 'Se requiere cuenta mayor para nivel 2 y 3', type: 'error'});
            }

            const dataToSend = {
                descripcion: saveParams.descripcion,
                tipoCuenta_Id: saveParams.tipoCuenta_Id,
                permiteTransacciones: saveParams.permiteTransacciones,
                nivel: saveParams.nivel,
                cuentaMayor_Id: saveParams.nivel === 1 ? null : saveParams.cuentaMayor_Id,
                balance: saveParams.balance || 0,
                estado_Id: saveParams.estado_Id
            };

            if (saveParams.id) {
                // Actualizar cuenta
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'catalogoCuentas', data: dataToSend, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    const errorMsg = resp?.info?.[0]?.error || 'Error al actualizar la cuenta';
                    showMessage({msg: errorMsg, type:'error'});
                } else {
                    fetchCatalogoCuentas();
                    showMessage({msg:'Cuenta actualizada exitosamente', type: 'success'});
                    close();
                }

            } else {
                // Insertar nueva cuenta
                const resp = await apiPost({ path: 'catalogoCuentas', data: dataToSend });
                const id = resp?.info?.[0]?.id ?? null;
                const errorMsg = resp?.info?.[0]?.error ?? null;
                
                if (id === null || errorMsg) {
                    setLoading(false);
                    showMessage({msg: errorMsg || 'Error al crear la cuenta', type:'error'});
                } else {
                    fetchCatalogoCuentas();
                    showMessage({msg:'Cuenta creada exitosamente', type: 'success'});
                    close();
                }
            }
        } catch (error) {
            console.error(error);
            showMessage({msg:'Ocurrió un error al guardar la cuenta', type:'error'});
        } finally {
            setLoading(false);
        }
    }

    const onChangeTipoCuenta = (newValue: any) => {
        setSaveParams({ ...saveParams, tipoCuenta_Id: newValue.value });
    };

    const onChangeCuentaMayor = (newValue: any) => {
        setSaveParams({ ...saveParams, cuentaMayor_Id: newValue.value });
    };

    const close = () => {
        setErrors([]);
        setAddCatalogoCuentasModal(false);
        setSaveParams(JSON.parse(JSON.stringify(catalogoCuentasDefault)));
    }

    return (
        <Transition appear show={addCatalogoCuentasModal} as={Fragment}>
            <Dialog
                as="div"
                open={addCatalogoCuentasModal}
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
                                        {saveParams?.id ? 'Editar Cuenta Contable' : 'Añadir Cuenta Contable'}
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
                                                    placeholder="Ingrese la descripción de la cuenta"
                                                    className="form-input"
                                                    value={saveParams.descripcion}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('tipoCuenta_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="tipoCuenta_Id" className="form-label flex">
                                                    Tipo de Cuenta *
                                                </label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions
                                                    value={displayedTiposCuenta.find((i: any) => i.value === saveParams.tipoCuenta_Id) || null}
                                                    loadOptions={promiseOptionsTiposCuenta}
                                                    onChange={(newValue: any) => onChangeTipoCuenta(newValue)}
                                                    menuPlacement="auto"
                                                    maxMenuHeight={120}
                                                    placeholder="Selecciona un tipo de cuenta"
                                                    noOptionsMessage={() => "No se encontraron tipos de cuenta"}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('nivel') ? 'has-error' : ''}`}>
                                                <label htmlFor="nivel" className="form-label flex">
                                                    Nivel *
                                                </label>
                                                <select
                                                    id="nivel"
                                                    className="form-input"
                                                    value={saveParams.nivel}
                                                    onChange={(e) => changeValue(e)}
                                                >
                                                    <option value="">Seleccione el nivel</option>
                                                    <option value={1}>Nivel 1 (Principal)</option>
                                                    <option value={2}>Nivel 2 (Subcuenta)</option>
                                                    <option value={3}>Nivel 3 (Detalle)</option>
                                                </select>
                                            </div>

                                            {saveParams.nivel > 1 && (
                                                <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('cuentaMayor_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="cuentaMayor_Id" className="form-label flex">
                                                        Cuenta Mayor *
                                                    </label>
                                                    <AsyncSelect
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedCuentasMayor.find((i: any) => i.value === saveParams.cuentaMayor_Id) || null}
                                                        loadOptions={promiseOptionsCuentasMayor}
                                                        onChange={(newValue: any) => onChangeCuentaMayor(newValue)}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona una cuenta mayor"
                                                        noOptionsMessage={() => "No se encontraron cuentas mayor disponibles"}
                                                    />
                                                </div>
                                            )}

                                            <div className="mb-5">
                                                <label htmlFor="balance" className="form-label flex">
                                                    Balance Inicial
                                                </label>
                                                <input
                                                    id="balance"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="form-input"
                                                    value={saveParams.balance || 0}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('permiteTransacciones') ? 'has-error' : ''}`}>
                                                <label className="form-label flex">
                                                    Configuración
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        id="permiteTransacciones"
                                                        type="checkbox"
                                                        className="form-checkbox"
                                                        checked={saveParams.permiteTransacciones || false}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    <label htmlFor="permiteTransacciones" className="ml-2">
                                                        Permite Transacciones
                                                    </label>
                                                </div>
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
                                                onClick={() => saveCatalogoCuentas()}
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

export default SaveCatalogoCuentaContablesModal;