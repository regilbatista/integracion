import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import {showMessage} from '@/utils/notifications'
import { apiGet, apiPost, apiPatch } from '@/lib/api/admin';

const SaveAuxiliaresModal = (props: any) => {
    const { addAuxiliaresModal, setAddAuxiliaresModal, setSaveParams, saveParams, fetchAuxiliares, auxiliaresDefault } = props;
    const [errors, setErrors] = useState<String[]>([]);
    const errorsTags = ['nombre']; // El endpoint requiere 'nombre', no 'descripcion'
    const [loading, setLoading] = useState(false);

    useEffect (() => { 
        console.log(saveParams,'saveParams');
    }, [saveParams]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setSaveParams({ ...saveParams, [id]: value });
    };

    const checkErrors = () => {
        const emptyList = errorValidation(errorsTags, saveParams);
        setErrors(emptyList);
        return emptyList.length;
    };

    const saveAuxiliares = async () => {
       try {
            saveParams.estado_Id = 1;
            setLoading(true);
            const errorsCount = checkErrors();
            
            if (errorsCount > 0) {
                setLoading(false);
                return showMessage({msg: 'Por favor complete el formulario', type: 'error'});
            }

            if (saveParams.id) {
                // Actualizar auxiliar
                const id = saveParams.id;
                const resp = await apiPatch({ path: 'auxiliares', data: saveParams, id });
                if (resp?.info?.[0]?.msg !== 'ok') {
                    setLoading(false);
                    const errorMsg = resp?.info?.[0]?.error || 'Error al actualizar el auxiliar';
                    showMessage({msg: errorMsg, type:'error'});
                } else {
                    fetchAuxiliares();
                    showMessage({msg:'Auxiliar actualizado exitosamente', type: 'success'});
                    close();
                }

            } else {
                // Insertar nuevo auxiliar
                const resp = await apiPost({ path: 'auxiliares', data: saveParams });
                const id = resp?.info?.[0]?.id ?? null;
                const errorMsg = resp?.info?.[0]?.error ?? null;
                
                if (id === null || errorMsg) {
                    setLoading(false);
                    showMessage({msg: errorMsg || 'Error al crear el auxiliar', type:'error'});
                } else {
                    fetchAuxiliares();
                    showMessage({msg:'Auxiliar creado exitosamente', type: 'success'});
                    close();
                }
            }
        } catch (error) {
            console.error(error);
            showMessage({msg:'Ocurrió un error al guardar el auxiliar', type:'error'});
        } finally {
            setLoading(false);
        }
    }

    const close = () => {
        setErrors([]);
        setAddAuxiliaresModal(false);
        setSaveParams(JSON.parse(JSON.stringify(auxiliaresDefault)));
    }

    return (
        <Transition appear show={addAuxiliaresModal} as={Fragment}>
            <Dialog
                as="div"
                open={addAuxiliaresModal}
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
                                className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar Auxiliar' : 'Añadir Auxiliar'}
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
                                        <div className="mb-5">
                                            <div className={`mb-5 ${errors.includes('nombre') ? 'has-error' : ''}`}>
                                                <label htmlFor="nombre" className="form-label flex">
                                                    Nombre *
                                                </label>
                                                <input
                                                    id="nombre"
                                                    type="text"
                                                    placeholder="Ingrese el nombre del auxiliar"
                                                    className="form-input"
                                                    value={saveParams.nombre}
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
                                                onClick={() => saveAuxiliares()}
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

export default SaveAuxiliaresModal;