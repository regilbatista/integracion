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
import { apiGet as getAdm} from '@/lib/api/admin';
import { useAuth } from '@/src/context/authContext';
import { permissionRequired }from '@/utils/auth'

const selectDefault: {
    value: number;
    label: string;
}[] = [];


    const SaveRentaDevolucionModal = (props: any) => {
        const { addRentDevolutionModal, setAddRentDevolutionModal, setSaveParams, saveParams, fentchRentDevolution, rentdevolutionDefault } = props;
        const { auth } = useAuth();
        const [errors, setErrors] = useState<String[]>([]);
        const errorsTags = ['empleado_Id', 'vehiculo_Id', 'cliente_Id', 'FechaRenta', 'FechaDevolucion', 'MontoPorDia', 'CantidadDias', 'Comentario'];
        const [loading, setLoading] = useState(false);
        const [displayedEmpleado, setdisplayedEmpleado] = useState(JSON.parse(JSON.stringify(selectDefault)));
        const [displayedVehiculo, setdisplayedVehiculo] = useState(JSON.parse(JSON.stringify(selectDefault)));
        const [displayedCliente, setdisplayedCliente] = useState(JSON.parse(JSON.stringify(selectDefault)));
         const today = new Date().toISOString().split("T")[0];
        //const [allUser, setAllUser] = useState<any>([]);
        
        let allEmpleado: any = useRef(null);
        let allVehiculo: any = useRef(null);
        let allCliente: any = useRef(null);
    

        useEffect (() => { 
            console.log(saveParams,'saveParams');
        }, [saveParams]);

        const handleFechaRentaChange = (e: any) => {
            const newFechaRenta = e.target.value;

            if (newFechaRenta < today) {
                return showMessage({msg: 'La fecha de renta no puede ser menor a hoy.', type: 'error'});
            }

            changeValue(e);
        };

        const handleFechaDevolucionChange = (e: any) => {
            const newFechaDevolucion = e.target.value;

            if (newFechaDevolucion < saveParams.FechaRenta) {
                return showMessage({msg: 'La fecha de devolución no puede ser menor a la fecha de renta.', type: 'error'});
            }

            changeValue(e);
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
            const response = await apiGet({ path: 'rentadevolucion/vehiculos' });
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
 

     

        const checkErrors = () => {
            const emptyList = errorValidation(errorsTags, saveParams);
            setErrors(emptyList);
            return emptyList.length;
        };

        const changeValue = (e: any) => {
            const { value, id } = e.target;
            let xvalue = null;
            
            // Convertir el valor a booleano si es 'true' o 'false'
            xvalue = value === 'true' ? true : value === 'false' ? false : value;
        
            // Usar una función de actualización segura para trabajar con el estado anterior
            setSaveParams((prevState:any) => ({
                ...prevState,
                [id]: xvalue,
            }));
        };
        

        const saveRentDevolution = async () => {
           try {
                setLoading(true);
                const errorsCount = checkErrors();
                if (errorsCount > 0) {
                    setLoading(false);
                    return showMessage({msg: 'Please complete the form', type: 'error'});
                }
                if (saveParams.id) {
                    // Update task
                    const id = saveParams.id;
                    const resp = await apiPatch({ path: 'rentadevolucion', data: saveParams, id });
                    if (resp?.info?.[0]?.msg !== 'ok') {
                        setLoading(false);
                        // Added optional chaining
                        showMessage({msg:'Error saving ticket', type:'error'});
                    } else {
                        fentchRentDevolution();
                        close();
                    }

                } else {
                    // Insert task
                    const payload = {
                        id: null,
                        empleado_Id: saveParams.empleado_Id ?? null,
                        vehiculo_Id: saveParams.vehiculo_Id ?? null,
                        cliente_Id: saveParams.cliente_Id ?? null,
                        FechaRenta: saveParams.FechaRenta ?? null,
                        FechaDevolucion: saveParams.FechaDevolucion ?? null,
                        MontoPorDia: saveParams.MontoPorDia ?? null,
                        CantidadDias: saveParams.CantidadDias ?? null,
                        Comentario: saveParams.Comentario ?? '',
                        estado_Id: 1
                    };
                    
                    const resp = await apiPost({ path: 'rentadevolucion', data: payload });
                    const id = resp?.info?.[0]?.id ?? null; // Added optional chaining and nullish coalescing

                if (id === null) {
                    setLoading(false);
                    showMessage({msg:'Error saving the Item', type:'error'});
                } else {
                    fentchRentDevolution();
                    showMessage({msg:'The Item has been saved successfully.'});
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

        const onChangeValue = (newValue: any, input: string) => {
            setSaveParams((prevState:any) => {
                switch (input) {
                    case 'empleado_Id':
                        return { ...prevState, empleado_Id: newValue.value };
                    case 'vehiculo_Id':
                        return { ...prevState, vehiculo_Id: newValue.value };
                    case 'cliente_Id':
                        return { ...prevState, cliente_Id: newValue.value };
                    case 'modelo_Id':
                        return { ...prevState, modelo_Id: newValue.value };
                    default:
                        return prevState;
                }
            });
        };
        
        const close = () => {
            setAddRentDevolutionModal(false);
            setSaveParams(rentdevolutionDefault);
        }

    


    return (
        <Transition appear show={addRentDevolutionModal} as={Fragment}>
            <Dialog
                as="div"
                open={addRentDevolutionModal}
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
                                        {saveParams?.id ? 'Editar rentadevolucion' : 'Añadir rentadevolucion'}
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
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('empleado_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="empleado_Id" className="flex form-label">
                                                        Empleado 
                                                    </label>
                                                    <AsyncSelect //Category
                                                        cacheOptions
                                                        defaultOptions
                                                        isDisabled={!permissionRequired(['admin'], auth.permissions || []) }
                                                        value={displayedEmpleado.filter((i: any) => i.value == saveParams.empleado_Id)[0]}
                                                        loadOptions={promiseOptionsEmpleado}
                                                        onChange={(newValue: any) => onChangeValue(newValue, 'empleado_Id' )}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un Empleado"
                                                    />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('vehiculo_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="vehiculo_Id" className="flex form-label">
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
                                                    <label htmlFor="cliente_Id" className="flex form-label">
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
                                                        placeholder="Selecciona un Cliente"
                                                    />
                                            </div>

                                            <div className="mb-5 flex w-full flex-row gap-4">
                                                <div className={`flex-1 ${errors.includes("FechaRenta") ? "has-error" : ""}`}>
                                                    <label htmlFor="FechaRenta">Fecha de Renta</label>
                                                    <input
                                                        id="FechaRenta"
                                                        type="date"
                                                        name="FechaRenta"
                                                        className="form-input w-full rounded border p-2"
                                                        value={saveParams.FechaRenta?.split("T")[0] || ""}
                                                        onChange={handleFechaRentaChange}
                                                    />
                                                </div>
                                                <div className={`flex-1 ${errors.includes("FechaDevolucion") ? "has-error" : ""}`}>
                                                    <label htmlFor="FechaDevolucion">Fecha de Devolución</label>
                                                    <input
                                                        id="FechaDevolucion"
                                                        type="date"
                                                        name="FechaDevolucion"
                                                        className="form-input w-full rounded border p-2"
                                                        value={saveParams.FechaDevolucion?.split("T")[0] || ""}
                                                        onChange={handleFechaDevolucionChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-5 flex w-full flex-row gap-4">
                                                <div className={`flex-1 ${errors.includes("MontoPorDia") ? "has-error" : ""}`}>
                                                <label htmlFor="MontoPorDia" className="form-label flex">
                                                Monto Por Dia
                                                </label>
                                                <input
                                                        id="MontoPorDia"
                                                        type="number"
                                                        placeholder="Ingrese el Monto Por Día"
                                                        className="form-input w-full"
                                                        value={saveParams.MontoPorDia || ''}
                                                        onChange={(e: any) => changeValue(e)}
                                                        min="0"
                                                        step="0.01"
                                                        onInput={(e: any) => {
                                                            e.target.value = e.target.value.replace(/\D/g, ""); // Elimina caracteres no numéricos
                                                            if (e.target.value < 0.01) {
                                                              e.target.value = 0.01;
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
                                                <div className={`flex-1 ${errors.includes("CantidadDias") ? "has-error" : ""}`}>
                                                <label htmlFor="CantidadDias" className="form-label flex">
                                                Cantidad de Dias
                                                </label>
                                                <input
                                                    id="CantidadDias"
                                                    type="number"
                                                    placeholder="Ingrese la Cantidad de Días"
                                                    className="form-input w-full"
                                                    value={saveParams.CantidadDias || ''}
                                                    onChange={(e) => changeValue(e)}
                                                    min="1"
                                                    step="1"
                                                    onInput={(e: any) => {
                                                        // Asegurarse de que el valor sea un número entero mayor o igual a 1
                                                        e.target.value = e.target.value.replace(/\D/g, ""); // Elimina caracteres no numéricos
                                                        if (e.target.value === "" || parseInt(e.target.value, 10) < 1) {
                                                            e.target.value = "1"; // Establece el mínimo en 1
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "." || e.key === ",") {
                                                            e.preventDefault(); // Bloquea la entrada de decimales
                                                        }
                                                    }}
                                                />

                                                </div>
                                            </div>
                                            <div className={`mb-5 ${errors.includes('Comentario') ? 'has-error' : ''}`}>
                                                <label htmlFor="Comentario" className="form-label flex">
                                                    Comentario
                                                </label>
                                                <textarea
                                                    id="Comentario"
                                                    rows={3} // Ajusta la altura inicial del textarea
                                                    placeholder="Comentario"
                                                    className="form-input"
                                                    value={saveParams.Comentario}
                                                    onChange={(e: any) => changeValue(e)}
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
                                                    onClick={() => saveRentDevolution()}
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
export default SaveRentaDevolucionModal;
