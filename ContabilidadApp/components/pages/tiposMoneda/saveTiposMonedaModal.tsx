import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import {showMessage} from '@/utils/notifications'
import { apiGet, apiPost, apiPatch } from '@/lib/api/admin';

const SaveTiposMonedaModal = (props: any) => {
    const { addTiposMonedaModal, setAddTiposMonedaModal, setSaveParams, saveParams, fetchTiposMoneda, tiposMonedaDefault, isEdit, setIsEdit } = props;
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = ['descripcion', 'ultimaTasaCambiaria', 'estado_Id'];
    const [loading, setLoading] = useState(false);

    useEffect (() => { 
        console.log(saveParams,'saveParams');
    }, [saveParams]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        let xvalue = null;
        
        // Manejar conversión de tipos específicos para tipos de moneda
        if (id === 'ultimaTasaCambiaria') {
            xvalue = parseFloat(value) || 0;
        } else if (id === 'estado_Id') {
            xvalue = parseInt(value) || 1;
        } else {
            xvalue = value === 'true' ? true : value === 'false' ? false : value;
        }
        
        setSaveParams({ ...saveParams, [id]: xvalue });
    };

    const checkErrors = () => {
        const emptyList = errorValidation(errorsTags, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const saveTiposMoneda = async () => {
       try {
            setLoading(true);
            const errorsCount = checkErrors();
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({msg: 'Please complete the form', type: 'error'});
            }

            if (saveParams.id) {
                // Update currency type
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'tiposMoneda', data: saveParams, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    showMessage({msg:'Error saving currency type', type:'error'});
                } else {
                    fetchTiposMoneda();
                    showMessage({msg:'Currency type updated successfully.'});
                    close();
                }
            } else {
                // Insert currency type
                const resp = await apiPost({ path: 'tiposMoneda', data: saveParams });
                const id = resp?.info?.[0]?.id ?? null;
                
                if (id === null) {
                    setLoading(false);
                    showMessage({msg: 'Error saving currency type' , type:'error'});
                } else {
                    fetchTiposMoneda();
                    showMessage({msg:'Currency type has been saved successfully.'});
                    close();
                }
            }
        } catch (error) {
            console.error(error);
            showMessage({msg:'An error occurred while saving the currency type', type:'error'});
        } finally {
            setLoading(false);
        }
    }

    const close = () => {
        setErrors([]);
        setIsEdit(false);
        setAddTiposMonedaModal(false);
        setSaveParams(tiposMonedaDefault);
    }

    return (
        <Transition appear show={addTiposMonedaModal} as={Fragment}>
            <Dialog
                as="div"
                open={addTiposMonedaModal}
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
                                className={`panel 
                            w-full max-w-lg
                             overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark`}
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar Tipo de Moneda' : 'Añadir Tipo de Moneda'}
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
                                        <div>
                                            <div className={`mb-5 ${errors.includes('descripcion') ? 'has-error' : ''}`}>
                                                <label htmlFor="descripcion" className="form-label flex">
                                                    Descripción
                                                </label>
                                                <input
                                                    id="descripcion"
                                                    type="text"
                                                    placeholder="Ingrese la descripción de la moneda"
                                                    className="form-input"
                                                    value={saveParams.descripcion || ''}
                                                    onChange={(e) => changeValue(e)}
                                                    maxLength={50}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('ultimaTasaCambiaria') ? 'has-error' : ''}`}>
                                                <label htmlFor="ultimaTasaCambiaria" className="form-label flex">
                                                    Última Tasa Cambiaria
                                                </label>
                                                <input
                                                    id="ultimaTasaCambiaria"
                                                    type="number"
                                                    placeholder="Ingrese la tasa de cambio"
                                                    className="form-input"
                                                    value={saveParams.ultimaTasaCambiaria || ''}
                                                    onChange={(e) => changeValue(e)}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('estado_Id') ? 'has-error' : ''}`}>
                                                <label htmlFor="estado_Id" className="form-label flex">
                                                    Estado
                                                </label>
                                                <select 
                                                    id="estado_Id" 
                                                    className="form-select w-full" 
                                                    value={saveParams.estado_Id || 1} 
                                                    onChange={changeValue}
                                                >
                                                    <option value={1}>Activo</option>
                                                    <option value={2}>Inactivo</option>
                                                </select>
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
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                className={`btn btn-success gap-2 ltr:ml-4 rtl:mr-4 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                                                onClick={() => saveTiposMoneda()}
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

export default SaveTiposMonedaModal;