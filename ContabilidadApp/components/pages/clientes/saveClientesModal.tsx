import { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { errorValidation } from '@/utils/utilities';
import AsyncSelect from 'react-select/async';
import Tippy from '@tippyjs/react';
import dynamic from 'next/dynamic';
import { split } from 'lodash';
import InputMask from 'react-input-mask';
import {showMessage} from '@/utils/notifications'
import { validaCedula } from '@/utils/utilities';
import { apiGet, apiPost, apiPatch } from '@/lib/api/main';


const selectDefault: {
    value: number;
    label: string;
}[] = [];

    const SaveClientesModal = (props: any) => {
        const { addCustomersModal, setAddCustomersModal, setSaveParams, saveParams, fentchCustomers, customersDefault } = props;
        const [errors, setErrors] = useState<String[]>([]);
        const errorsTags = ['nombre', 'cedula', 'NoTarjetaCR', 'limiteCredito','tipoPersona'];
        const listPersona = ['Física', 'Jurídica'];
        const [loading, setLoading] = useState(false);
        const [displayedUsers, setdisplayedUsers] = useState(JSON.parse(JSON.stringify(selectDefault)));
        //const [allUser, setAllUser] = useState<any>([]);
        
        let allUser: any = useRef(null);

        useEffect (() => { 
            console.log(saveParams,'saveParams');
        }, [saveParams]);

        
    const promiseOptionsUser = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allUser.current.filter((item: any) => {
                return item.name.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'clientes/users' });
            result = response.info;
            allUser.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.id,
                    label: item.user, 
                };
        });

        setdisplayedUsers(result.filter((i: any) => i.value !== id));

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

        const saveCustomers = async () => {
           try {
            saveParams.estado_Id=1;
                setLoading(true);
                const errorsCount = checkErrors();
                if (errorsCount > 0) {
                    setLoading(false);
                    return showMessage({msg: 'Please complete the form', type: 'error'});
                }
                if (saveParams.id) {
                    // Update task
                    const id = saveParams.id;
                    const resp = await apiPatch({ path: 'clientes', data: saveParams, id });
                    if (resp?.info?.[0]?.msg !== 'ok') {
                        setLoading(false);
                        // Added optional chaining
                        showMessage({msg:'Error saving item', type:'error'});
                    } else {
                        fentchCustomers();
                        showMessage({msg:'Item saved successfully', type: 'success'});
                        close();
                    }

                } else {
                    // Insert task
                    const resp = await apiPost({ path: 'clientes', data: saveParams });
                    const id = resp?.info?.[0]?.id ?? null; // Added optional chaining and nullish coalescing
                    const msg = resp?.info?.[0]?.msg ?? null;
                    console.log(id, 'id');
                if (id === null) {
                    setLoading(false);
                   
                    showMessage({msg: msg ? msg : 'Error saving item' , type:'error'});
                } else {
                    fentchCustomers();
                    showMessage({msg:'Item saved successfully', type: 'success'});
                    close();
                }
                }
                
     
                
                // refreshTasks();
            } catch (error) {
                console.error(error);
                showMessage({msg:'An error occurred while saving the task', type:'error'});
            } finally {
                setLoading(false);
            }
        }

        const onChangeValue = (newValue: any) => {
            setSaveParams({ ...saveParams, user_Id: newValue.value });
        };
    
        const close = () => {
            setAddCustomersModal(false);
            setSaveParams(customersDefault);
        }


    return (
        <Transition appear show={addCustomersModal} as={Fragment}>
            <Dialog
                as="div"
                open={addCustomersModal}
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
                            {/* ${auth.permissions.includes('sys-adm') || auth.permissions.includes('it-access') ? 'w-full max-w-[100%]  md:w-[70%] lg:w-[950px]' : 'w-full max-w-lg'} */}
                            <Dialog.Panel
                                className={`panel 
                            w-full max-w-lg
                             overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark`}
                            >
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {saveParams?.id ? 'Editar clientes' : 'Añadir clientes'}
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
                                    <form
                                    //className={`${auth.permissions.includes('sys-adm') || auth.permissions.includes('it-access') ? 'block lg:flex' : ''}`}
                                    >
                                        <div
                                        //className={`${auth.permissions.includes('sys-adm') || auth.permissions.includes('it-access') ? 'lg:m-3 lg:w-[36%]' : ''} min-w-[250px]`}
                                        >
                                            <div className={`mb-5 ${errors.includes('nombre') ? 'has-error' : ''}`}>
                                                <label htmlFor="nombre" className="form-label flex">
                                                    nombre
                                                </label>
                                                <input
                                                    id="nombre"
                                                    type="text"
                                                    placeholder="Enter nombre del cliente"
                                                    className="form-input"
                                                    value={saveParams.nombre}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('cedula') ? 'has-error' : ''}`}>
                                                <label htmlFor="cedula" className="form-label flex">
                                                    Cedula
                                                </label>
                                                <InputMask
                                                    id="cedula"
                                                    type="text"
                                                    placeholder="000-0000000-0"
                                                    className="form-input"
                                                    mask="999-9999999-9"
                                                    value={saveParams.cedula}
                                                    onBlur={handleBlur}
                                                    onChange={(e: any) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('NoTarjetaCR') ? 'has-error' : ''}`}>
                                                <label htmlFor="NoTarjetaCR" className="form-label flex">
                                                    No. tarjeta de credito 
                                                </label>
                                                <InputMask
                                                    id="NoTarjetaCR"
                                                    type="text"
                                                    placeholder="0000-0000-0000-0000"
                                                    className="form-input"
                                                    mask="9999-9999-9999-9999"
                                                    value={saveParams.NoTarjetaCR}
                                                    onBlur={handleBlur}
                                                    onChange={(e: any) => changeValue(e)}
                                                />
                                            </div>

                                            <div className="mb-5 flex w-full flex-row gap-4">
                                            <div className={`flex-1 ${errors.includes('limiteCredito') ? 'has-error' : ''}`}>
                                                    <label htmlFor="limiteCredito" className="form-label flex">
                                                        Porcentaje de Comisión
                                                    </label>
                                                    <input
                                                        id="limiteCredito"
                                                        type="number"
                                                        placeholder="Ingrese el porcentaje"
                                                        className="form-input w-full"
                                                        value={saveParams.limiteCredito || ''}
                                                        onBlur={handleBlur}
                                                        onChange={(e: any) => changeValue(e)}
                                                        min="0"
                                                        max="10000000000000.00"
                                                        step="0.01"
                                                        onInput={(e: any) => {
                                                            if (e.target.value < 1) {
                                                              e.target.value = 1;
                                                            } else if (e.target.value > 10000000000000) {
                                                              e.target.value = 10000000000000;
                                                            }
                                                        
                                                            // Limitar a 2 decimales
                                                            if (e.target.value && e.target.value.includes('.')) {
                                                              let [integer, decimal] = e.target.value.split('.');
                                                              if (decimal && decimal.length > 2) {
                                                                e.target.value = `${integer}.${decimal.substring(0, 2)}`;
                                                              }
                                                            }
                                                          }}
                                                    />
                                                </div>
                                                <div className={`flex-1 ${errors.includes('tipoPersona') ? 'has-error' : ''}`}>
                                                    <label htmlFor="tipoPersona" className="form-label flex">
                                                        Tanda
                                                    </label>
                                                    <select id="tipoPersona" className="form-select w-full" value={saveParams.tipoPersona || ''} onChange={changeValue}>
                                                        <option value="">Seleccione la tanda</option>
                                                        {listPersona.map((tanda: any, i: number) => (
                                                            <option key={i} value={tanda}>
                                                                {tanda}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
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
                                                    onClick={() => saveCustomers()}
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
                                                        <><i className="fa-solid fa-floppy-disk"></i>
                                                        {'Add'}</>
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
export default SaveClientesModal;
