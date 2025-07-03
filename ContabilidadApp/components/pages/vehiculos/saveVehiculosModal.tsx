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
import { apiGet, apiPost, apiPatch } from '@/lib/api/admin';


const selectDefault: {
    value: number;
    label: string;
}[] = [];

    const SaveVehiculosModal = (props: any) => {
        const { addVehiclesModal, setAddVehiclesModal, setSaveParams, saveParams, fentchVehicles, vehiclesDefault } = props;
        const [errors, setErrors] = useState<String[]>([]);
        const errorsTags = ['descripcion', 'NoChasis', 'NoMotor', 'NoPlaca','tipoVehiculo_Id', 'marca_Id', 'modelo_Id', 'tipoCombustible_Id'];
        const [loading, setLoading] = useState(false);
        const [displayedTipoVehiculo, setdisplayedTipoVehiculo] = useState(JSON.parse(JSON.stringify(selectDefault)));
        const [displayedTipoCombustible, setdisplayedTipoCombustible] = useState(JSON.parse(JSON.stringify(selectDefault)));
        const [displayedBrand, setdisplayedBrand] = useState(JSON.parse(JSON.stringify(selectDefault)));
        const [displayedModel, setdisplayedModel] = useState(JSON.parse(JSON.stringify(selectDefault)));
        //const [allUser, setAllUser] = useState<any>([]);
        
        let allUser: any = useRef(null);
        let allTipoVehiculo: any = useRef(null);
        let allTipoCombustible: any = useRef(null);
        let allBrand: any = useRef(null);
        let allModel: any = useRef(null);

        useEffect (() => { 
            console.log(saveParams,'saveParams');
        }, [saveParams]);

        
    const promiseOptionsTipoVehiculo = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allTipoVehiculo.current.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'tiposVehiculos' });
            result = response.info;
            allTipoVehiculo.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.id,
                    label: item.descripcion, 
                };
        });

        setdisplayedTipoVehiculo(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };
    const promiseOptionsTipoCombustible = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allTipoCombustible.current.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'tiposCombustible' });
            result = response.info;
            allTipoCombustible.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.id,
                    label: item.descripcion, 
                };
        });

        setdisplayedTipoCombustible(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };

    const promiseOptionsBrand = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allBrand.current.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'marcas' });
            result = response.info;
            allBrand.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.id,
                    label: item.descripcion, 
                };
        });

        setdisplayedBrand(result.filter((i: any) => i.value !== id));

        return result.filter((i: any) => i.value !== id);
    };
    const promiseOptionsModel = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allModel.current.filter((item: any) => {
                return item.descripcion.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'modelos' });
            result = response.info;
            allModel.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.id,
                    label: item.descripcion, 
                };
        });

        setdisplayedModel(result.filter((i: any) => i.value !== id));

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

        const saveVehicles = async () => {
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
                    const resp = await apiPatch({ path: 'vehiculos', data: saveParams, id });
                    if (resp?.info?.[0]?.msg !== 'ok') {
                        setLoading(false);
                        // Added optional chaining
                        showMessage({msg:'Error saving ticket', type:'error'});
                    } else {
                        fentchVehicles();
                        close();
                    }

                } else {
                    // Insert task
                    const resp = await apiPost({ path: 'vehiculos', data: saveParams });
                    const id = resp?.info?.[0]?.id ?? null; // Added optional chaining and nullish coalescing

                if (id === null) {
                    setLoading(false);
                    showMessage({msg:'Error saving the Item', type:'error'});
                } else {
                    fentchVehicles();
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

        const onChangeValue = (newValue: any, input: string ) => {

            if (input === 'tipoVehiculo_Id') setSaveParams({ ...saveParams, tipoVehiculo_Id: newValue.value });
            if (input === 'tipoCombustible_Id') setSaveParams({ ...saveParams, tipoCombustible_Id: newValue.value });            
            if (input ==='marca_Id') setSaveParams({ ...saveParams, marca_Id: newValue.value });
            if (input ==='modelo_Id') setSaveParams({ ...saveParams, modelo_Id: newValue.value });
        };

        const close = () => {
            setAddVehiclesModal(false);
            setSaveParams(vehiclesDefault);
        }

    


    return (
        <Transition appear show={addVehiclesModal} as={Fragment}>
            <Dialog
                as="div"
                open={addVehiclesModal}
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
                                        {saveParams?.id ? 'Editar vehiculos' : 'Añadir vehiculos'}
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
                                            <div className={`mb-5 ${errors.includes('descripcion') ? 'has-error' : ''}`}>
                                                <label htmlFor="descripcion" className="form-label flex">
                                                    descripcion
                                                </label>
                                                <input
                                                    id="descripcion"
                                                    type="text"
                                                    placeholder="Enter descripcion del vehiculo"
                                                    className="form-input"
                                                    value={saveParams.descripcion}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('NoChasis') ? 'has-error' : ''}`}>
                                                <label htmlFor="NoChasis" className="form-label flex">
                                                    No.Chasis
                                                </label>
                                                <InputMask
                                                    id="NoChasis"
                                                    type="text"
                                                    placeholder="******************"
                                                    className="form-input"
                                                    mask="******************"
                                                    maskChar=""
                                                    alwaysShowMask={false}
                                                    value={saveParams.NoChasis}
                                                    onChange={(e: any) => changeValue(e)}
                                                />
                                            </div>

                                            <div className={`mb-5 ${errors.includes('NoMotor') ? 'has-error' : ''}`}>
                                                <label htmlFor="NoMotor" className="form-label flex">
                                                    No.Motor
                                                </label>
                                                <InputMask
                                                    id="NoMotor"
                                                    type="text"
                                                    placeholder="*****************"
                                                    className="form-input"
                                                    mask="**********"
                                                    maskChar=""
                                                    alwaysShowMask={false}
                                                    value={saveParams.NoMotor}
                                                    onChange={(e: any) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('NoPlaca') ? 'has-error' : ''}`}>
                                                <label htmlFor="NoPlaca" className="form-label flex">
                                                    No.Placa
                                                </label>
                                                <InputMask
                                                    id="NoPlaca"
                                                    type="text"
                                                    placeholder="*******"
                                                    className="form-input"
                                                    mask="*******"
                                                    maskChar=""
                                                    alwaysShowMask={false}
                                                    value={saveParams.NoPlaca}
                                                    onChange={(e: any) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('tipoVehiculo_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="tipoVehiculo_Id" className="flex form-label">
                                                        Tipo de Vehiculo  
                                                    </label>
                                                    <AsyncSelect //Category
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedTipoVehiculo.filter((i: any) => i.value == saveParams.tipoVehiculo_Id)[0]}
                                                        loadOptions={promiseOptionsTipoVehiculo}
                                                        onChange={(newValue: any) => onChangeValue(newValue, 'tipoVehiculo_Id' )}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un user"
                                                    />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('tipoCombustible_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="tipoCombustible_Id" className="flex form-label">
                                                    Tipo de Combustible 
                                                    </label>
                                                    <AsyncSelect
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedTipoCombustible.filter((i: any) => i.value == saveParams.tipoCombustible_Id)[0]}
                                                        loadOptions={promiseOptionsTipoCombustible}
                                                        onChange={(newValue: any) => onChangeValue(newValue, 'tipoCombustible_Id')}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un user"
                                                    />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('marca_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="marca_Id" className="flex form-label">
                                                        Marca 
                                                    </label>
                                                    <AsyncSelect //Category
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedBrand.filter((i: any) => i.value == saveParams.marca_Id)[0]}
                                                        loadOptions={promiseOptionsBrand}
                                                        onChange={(newValue: any) => onChangeValue(newValue, 'marca_Id')}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un user"
                                                    />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('modelo_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="modelo_Id" className="flex form-label">
                                                        Modelo 
                                                    </label>
                                                    <AsyncSelect //Category
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedModel.filter((i: any) => i.value == saveParams.modelo_Id)[0]}
                                                        loadOptions={promiseOptionsModel}
                                                        onChange={(newValue: any) => onChangeValue(newValue, 'modelo_Id')}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un user"
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
                                                    onClick={() => saveVehicles()}
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
export default SaveVehiculosModal;
