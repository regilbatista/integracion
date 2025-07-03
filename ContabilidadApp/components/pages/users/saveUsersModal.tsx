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

    const SaveUsersModal = (props: any) => {
        const { addUsersModal, setAddUsersModal, setSaveParams, saveParams, fentchUsers, usersDefault, isEdit, setIsEdit} = props;
        const [errors, setErrors] = useState<String[]>([]);
        const errorsTags = [
            'user',
            !isEdit && 'confirmPassword',
            !isEdit && 'password',
            !isEdit && 'rol_Id'
          ].filter(Boolean);
        const [loading, setLoading] = useState(false);
        const [displayedRole, setdisplayedRole] = useState(JSON.parse(JSON.stringify(selectDefault)));
        //const [allRole, setallRole] = useState<any>([]);
        
        let allRole: any = useRef(null);

        useEffect (() => { 
            console.log(saveParams,'saveParams');
        }, [saveParams]);

        
    const promiseOptionsRole = async (inputValue: string, id: any) => {
        let result = [];

        if (inputValue !== '') {
            result = allRole.current.filter((item: any) => {
                return item.name.toString().toLowerCase().includes(inputValue.toLowerCase());
            });
        } else {
            const response = await apiGet({ path: 'users/roles' });
            result = response.info;
            allRole.current = result;
        }

        result = result.map((item: any) => {
                return {
                    value: item.name,
                    label: item.descripcion, 
                };
        });

        setdisplayedRole(result.filter((i: any) => i.value !== id));

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

        const saveUsers = async () => {
           try {
            saveParams.estado_Id = 1;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
            
            // Función para manejar errores de forma más eficiente
            const handleError = (field: string, condition: boolean, errorMsg: string) => {
              setErrors((prevErrors) => {
                if (condition) {
                  return Array.from(new Set([...prevErrors, field])); // Convierte el Set a Array
                } else {
                  return prevErrors.filter((error) => error !== field); // Remueve si es válida
                }
              });
              showMessage({ msg: errorMsg, type: 'error' });
            };
            
            if (password && password.length < 6) {
              handleError('password', !saveParams.password, 'Password must be at least 6 characters long');
              return;
            }
            
            if (password !== confirmPassword) {
              handleError('confirmPassword', !saveParams.confirmPassword, 'Passwords do not match');
              return;
            }
                setLoading(true);
                const errorsCount = checkErrors();
                if (errorsCount > 0) {
                    setLoading(false);
                    return showMessage({msg: 'Please complete the form', type: 'error'});
                }
                if (saveParams.id) {
                    // Update task
                    const id = saveParams.id;
                    const resp = await apiPatch({ path: 'users', data: saveParams, id });
                    if (resp?.info?.[0]?.msg !== 'ok') {
                        setLoading(false);
                        // Added optional chaining
                        showMessage({msg:'Error saving item', type:'error'});
                    } else {
                        fentchUsers();
                        showMessage({msg:'Item saved successfully', type: 'success'});
                        close();
                    }

                } else {
                    // Insert task
                    const resp = await apiPost({ path: 'users', data: saveParams });
                    const id = resp?.info?.[0]?.id ?? null; // Added optional chaining and nullish coalescing
                    const msg = resp?.info?.[0]?.msg ?? null;
                    console.log(id, 'id');
                if (id === null) {
                    setLoading(false);
                   
                    showMessage({msg: msg ? msg : 'Error saving item' , type:'error'});
                } else {
                    fentchUsers();
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
            setSaveParams({ ...saveParams, rol_Id: newValue.value });
        };
    
        const close = () => {
            setErrors([]);
            setIsEdit(false);
            setAddUsersModal(false);
            setSaveParams(usersDefault);
        }


    return (
        <Transition appear show={addUsersModal} as={Fragment}>
            <Dialog
                as="div"
                open={addUsersModal}
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
                                        {saveParams?.id ? 'Editar users' : 'Añadir users'}
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
                                            <div className={`mb-5 ${errors.includes('user') ? 'has-error' : ''}`}>
                                                <label htmlFor="user" className="form-label flex">
                                                    User
                                                </label>
                                                <input
                                                    id="user"
                                                    type="text"
                                                    placeholder="Enter user "
                                                    className="form-input"
                                                    value={saveParams.user}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('password') ? 'has-error' : ''}`}>
                                            <label htmlFor="password" className="form-label flex">
                                                        {   
                                                            isEdit ? 'Nueva Contraceña' : 'Contraceña'
                                                        }
                                                    </label>
                                                        <input id='password' type="password" placeholder="Enter Password" className="form-input"
                                                            {...((!isEdit) ? { required: true } : {})}
                                                            onChange={(e) => changeValue(e)}
                                                        />
                                            </div>
                                            <div className={`mb-5 ${errors.includes('confirmPassword') ? 'has-error' : ''}`}>
                                                <label htmlFor="confirmPassword" className="form-label flex">
                                                        {   
                                                            isEdit ? 'Confirma la nueva contraceña' : 'Confirma la contraceña'
                                                        }
                                                    </label>
                                                    <input
                                                    id='confirmPassword'
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    className="form-input"
                                                    {...((!isEdit) ? { required: true } : {})}
                                                    onChange={(e) => changeValue(e)}
                                                />
                                            </div>
                                            <div className={`custom-select css-b62m3t-container mb-5 ${errors.includes('rol_Id') ? 'has-error' : ''}`}>
                                                    <label htmlFor="rol_Id" className="form-label flex">
                                                        Rol 
                                                    </label>
                                                    <AsyncSelect
                                                        cacheOptions
                                                        defaultOptions
                                                        value={displayedRole.filter((i: any) => i.value == saveParams.rol_Id)[0]}
                                                        loadOptions={promiseOptionsRole}
                                                        onChange={(newValue: any) => onChangeValue(newValue)}
                                                        menuPlacement="auto"
                                                        maxMenuHeight={120}
                                                        placeholder="Selecciona un Rol"
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
                                                    onClick={() => saveUsers()}
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
export default SaveUsersModal;
